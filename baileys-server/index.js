const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pino = require("pino");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  delay,
} = require("@whiskeysockets/baileys");

dotenv.config();

const PORT = process.env.PORT || 4000;
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, "auth_info_baileys");
const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
const API_SECRET = process.env.API_SECRET || "";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// State container
let sock = null;
let isInitializing = false;
const sessionState = {
  state: "DISCONNECTED", // DISCONNECTED | CONNECTING | QR_READY | CONNECTED
  qrCodeDataUrl: null,
  qrRaw: null,
  phoneNumber: null,
  pushName: null,
  platform: "WhatsApp Multi-Device Engine (Baileys Live)",
  batteryLevel: 98,
  lastConnectedAt: null,
  messages: [],
};

// Auth middleware if API_SECRET is configured
function authMiddleware(req, res, next) {
  if (!API_SECRET) return next();
  const token = req.headers["x-api-secret"] || req.query.secret;
  if (token !== API_SECRET) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid API secret" });
  }
  next();
}

function addMessageLog(log) {
  sessionState.messages.unshift(log);
  if (sessionState.messages.length > 50) {
    sessionState.messages = sessionState.messages.slice(0, 50);
  }
}

// Format phone number to WhatsApp JID (e.g. +6281234 -> 6281234@s.whatsapp.net)
function formatJID(phone) {
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  }
  return clean.includes("@s.whatsapp.net") ? clean : `${clean}@s.whatsapp.net`;
}

// Forward inbound inspector messages to Next.js Webhook
async function forwardToWebhook(payload) {
  if (!WEBHOOK_URL) return;
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`[Webhook] Forwarded inbound message to ${WEBHOOK_URL} - Status: ${res.status}`);
  } catch (err) {
    console.error(`[Webhook Error] Failed to forward to ${WEBHOOK_URL}:`, err.message);
  }
}

// Start Baileys Socket
async function startWASocket() {
  if (isInitializing) return;
  isInitializing = true;

  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    let versionInfo = [2, 3000, 1015901307];
    try {
      const v = await fetchLatestBaileysVersion();
      if (v?.version) versionInfo = v.version;
    } catch (e) {
      console.warn("[Baileys] Could not fetch latest version, using fallback version");
    }

    sessionState.state = "CONNECTING";

    sock = makeWASocket({
      version: versionInfo,
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      auth: state,
      browser: ["InspectAI Quality OS", "Chrome", "1.0.0"],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      generateHighQualityLinkPreview: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        sessionState.qrRaw = qr;
        sessionState.state = "QR_READY";
        try {
          sessionState.qrCodeDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: "M",
            margin: 2,
            color: { dark: "#0284c7", light: "#ffffff" },
            width: 320,
          });
          console.log("[Baileys] New QR Code generated successfully. Ready for mobile scan.");
        } catch (qrErr) {
          console.error("[Baileys] QR Generation error:", qrErr);
        }
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Baileys] Connection closed (status: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        sessionState.state = "DISCONNECTED";
        sessionState.qrCodeDataUrl = null;
        sessionState.qrRaw = null;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("[Baileys] User logged out. Clearing auth directory.");
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
          sessionState.phoneNumber = null;
          sessionState.pushName = null;
        } else if (shouldReconnect) {
          setTimeout(() => {
            isInitializing = false;
            startWASocket();
          }, 4000);
        }
      } else if (connection === "open") {
        console.log("[Baileys] WhatsApp Socket CONNECTED successfully!");
        sessionState.state = "CONNECTED";
        sessionState.qrCodeDataUrl = null;
        sessionState.qrRaw = null;
        sessionState.lastConnectedAt = new Date().toISOString();

        const userJid = sock.user?.id || "";
        const rawPhone = userJid.split(":")[0] || userJid.split("@")[0] || "";
        sessionState.phoneNumber = rawPhone ? (rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`) : "+6281234567890";
        sessionState.pushName = sock.user?.name || "InspectAI Operations Hub";

        addMessageLog({
          id: `sys-${Date.now()}`,
          from: "WhatsApp Multi-Device",
          to: "InspectAI Gateway",
          senderName: "System Gateway",
          text: `📱 WhatsApp Device connected successfully (${sessionState.phoneNumber} - ${sessionState.pushName}). Ready to receive field photos & send automated dispatch broadcasts.`,
          direction: "INBOUND",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "READ",
        });
      }
    });

    // Inbound Messages Listener
    sock.ev.on("messages.upsert", async (m) => {
      if (m.type !== "notify") return;

      for (const msg of m.messages) {
        if (!msg.message) continue;
        if (msg.key.fromMe) continue; // Ignore messages sent by self

        const senderJid = msg.key.remoteJid || "";
        if (senderJid.includes("@g.us")) continue; // Skip group messages if personal inspection bot

        const senderPhone = `+${senderJid.split("@")[0]}`;
        const senderName = msg.pushName || "Field Inspector";

        // Extract message content
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          "";

        const hasImage = !!msg.message.imageMessage;
        const log = {
          id: msg.key.id || `in-${Date.now()}`,
          from: senderPhone,
          to: sessionState.phoneNumber || "InspectAI Bot",
          senderName,
          text: text || (hasImage ? "[Inspection Photo Attached]" : "[Media Message]"),
          mediaType: hasImage ? "image" : "none",
          direction: "INBOUND",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "READ",
        };

        addMessageLog(log);
        console.log(`[Baileys Inbound] Message from ${senderName} (${senderPhone}): ${text}`);

        // Forward to Next.js Webhook for Agent Orchestration
        forwardToWebhook({
          from: senderPhone,
          senderName,
          messageText: text,
          hasMedia: hasImage,
          isFinishedSignal:
            text.toLowerCase().includes("selesai") ||
            text.toLowerCase().includes("done") ||
            text.toLowerCase().includes("lengkap"),
          timestamp: new Date().toISOString(),
        });
      }
    });
  } catch (error) {
    console.error("[Baileys Init Error]:", error);
    sessionState.state = "DISCONNECTED";
  } finally {
    isInitializing = false;
  }
}

// ---------------- REST API ROUTES ---------------- //

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "InspectAI Baileys WhatsApp Gateway",
    connectionState: sessionState.state,
    phoneNumber: sessionState.phoneNumber,
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Get Session Status & QR Code
app.get("/status", authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: sessionState,
  });
});

// Trigger Connect / Refresh QR
app.post("/connect", authMiddleware, async (req, res) => {
  try {
    if (sessionState.state === "CONNECTED") {
      return res.json({ success: true, data: sessionState, message: "Already connected" });
    }

    if (!sock || sessionState.state === "DISCONNECTED") {
      startWASocket();
      // Brief delay to allow initial QR generation
      await delay(1500);
    }

    res.json({
      success: true,
      data: sessionState,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send WhatsApp Message
app.post("/send", authMiddleware, async (req, res) => {
  try {
    const { to, text, senderName = "InspectAI Dispatch Bot" } = req.body;

    if (!to || !text) {
      return res.status(400).json({ success: false, error: "Missing 'to' or 'text' parameter" });
    }

    if (sessionState.state !== "CONNECTED" || !sock) {
      return res.status(400).json({
        success: false,
        error: "WhatsApp is not connected. Please scan the QR code first.",
      });
    }

    const jid = formatJID(to);
    const sentMsg = await sock.sendMessage(jid, { text });

    const log = {
      id: sentMsg.key.id || `out-${Date.now()}`,
      from: sessionState.phoneNumber || "InspectAI Bot",
      to: to.startsWith("+") ? to : `+${to}`,
      senderName,
      text,
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "DELIVERED",
    };

    addMessageLog(log);

    res.json({
      success: true,
      data: log,
      messageId: sentMsg.key.id,
    });
  } catch (err) {
    console.error("[Baileys Send Error]:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to send WhatsApp message" });
  }
});

// Disconnect / Logout
app.post("/disconnect", authMiddleware, async (req, res) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch (e) {}
      sock = null;
    }

    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    } catch (e) {}

    sessionState.state = "DISCONNECTED";
    sessionState.phoneNumber = null;
    sessionState.pushName = null;
    sessionState.qrCodeDataUrl = null;
    sessionState.qrRaw = null;
    sessionState.lastConnectedAt = null;

    addMessageLog({
      id: `sys-${Date.now()}`,
      from: "System Gateway",
      to: "All",
      senderName: "System Gateway",
      text: "⚠️ WhatsApp session unlinked / disconnected.",
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "SENT",
    });

    res.json({
      success: true,
      message: "Successfully disconnected from WhatsApp",
      data: sessionState,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
const serverPort = Number(process.env.PORT) || 4000;
app.listen(serverPort, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`🚀 InspectAI Baileys WhatsApp Gateway running on 0.0.0.0:${serverPort}`);
  console.log(`📡 Webhook URL: ${WEBHOOK_URL || "(None - Inbound messages will be logged only)"}`);
  console.log(`🔒 API Secret: ${API_SECRET ? "Enabled" : "Disabled (Public API mode)"}`);
  console.log(`====================================================`);

  // Auto-init socket if auth credentials already exist
  if (fs.existsSync(path.join(AUTH_DIR, "creds.json"))) {
    console.log("[Baileys] Found existing session creds. Auto-connecting...");
    startWASocket();
  }
});
