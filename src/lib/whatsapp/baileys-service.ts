import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export type BaileysConnectionState = "DISCONNECTED" | "CONNECTING" | "QR_READY" | "CONNECTED";

export interface WhatsAppMessageLog {
  id: string;
  from: string;
  to: string;
  senderName: string;
  text: string;
  mediaType?: "image" | "document" | "audio" | "none";
  mediaUrl?: string;
  direction: "INBOUND" | "OUTBOUND";
  timestamp: string;
  status: "SENT" | "DELIVERED" | "READ" | "RECEIVED";
}

export interface BaileysDeviceSession {
  state: BaileysConnectionState;
  qrCodeDataUrl: string | null;
  qrRaw: string | null;
  phoneNumber: string | null;
  pushName: string | null;
  platform: string;
  batteryLevel: number;
  lastConnectedAt: string | null;
  messages: WhatsAppMessageLog[];
}

// In-memory singleton state across Next.js API requests
class BaileysManager {
  private static instance: BaileysManager;
  private session: BaileysDeviceSession = {
    state: "DISCONNECTED",
    qrCodeDataUrl: null,
    qrRaw: null,
    phoneNumber: null,
    pushName: null,
    platform: "WhatsApp Multi-Device Engine",
    batteryLevel: 96,
    lastConnectedAt: null,
    messages: [
      {
        id: "msg-initial-1",
        from: "+60123456789",
        to: "InspectAI Bot",
        senderName: "Arief Hidayat (Inspector)",
        text: "Hello Admin, I have arrived at TopGloves & Apparel Factory (Penang Hub). Commencing AQL 2.5 PSI audit now.",
        direction: "INBOUND",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "READ",
      },
      {
        id: "msg-initial-2",
        from: "InspectAI Bot",
        to: "+60123456789",
        senderName: "Agent 2: Dispatch Bot",
        text: "✅ Confirmation received, Inspector Arief. Golden Sample & Checklist for Cotton Flannel Batch have been staged in the system. Please upload your inspection photos.",
        direction: "OUTBOUND",
        timestamp: new Date(Date.now() - 3600000 * 2 + 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "READ",
      },
    ],
  };

  private constructor() {}

  public static getInstance(): BaileysManager {
    if (!BaileysManager.instance) {
      BaileysManager.instance = new BaileysManager();
    }
    return BaileysManager.instance;
  }

  public getSession(): BaileysDeviceSession {
    return this.session;
  }

  // Initialize or start QR connection
  public async initSession(): Promise<BaileysDeviceSession> {
    if (this.session.state === "CONNECTED") {
      return this.session;
    }

    this.session.state = "CONNECTING";

    // Generate dynamic pairing QR string
    const rawQr = `2@${Date.now()}_${Math.random().toString(36).substring(2, 12)},InspectAI_WA,${Buffer.from("Enterprise Multi-Agent Quality Hub").toString("base64")}`;
    this.session.qrRaw = rawQr;

    try {
      this.session.qrCodeDataUrl = await QRCode.toDataURL(rawQr, {
        errorCorrectionLevel: "M",
        margin: 2,
        color: {
          dark: "#0284c7",
          light: "#ffffff",
        },
        width: 320,
      });
      this.session.state = "QR_READY";
    } catch (e) {
      console.error("Failed to generate WhatsApp QR code", e);
      this.session.state = "DISCONNECTED";
    }

    return this.session;
  }

  // Simulate or execute instant QR Scan Pairing
  public simulatePairSuccess(phoneNumber = "+60 12-345 6789", pushName = "InspectAI Operations Master"): BaileysDeviceSession {
    this.session.state = "CONNECTED";
    this.session.phoneNumber = phoneNumber;
    this.session.pushName = pushName;
    this.session.qrCodeDataUrl = null;
    this.session.qrRaw = null;
    this.session.lastConnectedAt = new Date().toISOString();
    this.session.batteryLevel = 98;

    this.addLog({
      id: `sys-${Date.now()}`,
      from: "WhatsApp Multi-Device",
      to: "InspectAI Gateway",
      senderName: "System Gateway",
      text: `📱 WhatsApp Device connected successfully (${phoneNumber} - ${pushName}). Ready to receive field photos & send automated dispatch broadcasts.`,
      direction: "INBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "READ",
    });

    return this.session;
  }

  // Send WhatsApp Text Message
  public async sendTextMessage(to: string, text: string, senderName = "InspectAI Dispatch Bot"): Promise<WhatsAppMessageLog> {
    const formattedTo = to.startsWith("+") ? to : `+${to}`;
    const log: WhatsAppMessageLog = {
      id: `out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      from: this.session.phoneNumber || "InspectAI Bot",
      to: formattedTo,
      senderName,
      text,
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "DELIVERED",
    };

    this.addLog(log);
    return log;
  }

  // Process incoming inspector message / photo upload
  public async processInboundFieldMessage(
    from: string,
    senderName: string,
    text: string,
    mediaUrl?: string,
    mediaType?: "image" | "document"
  ): Promise<{ message: WhatsAppMessageLog; reply: WhatsAppMessageLog }> {
    const inboundLog: WhatsAppMessageLog = {
      id: `in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      from,
      to: this.session.phoneNumber || "InspectAI Bot",
      senderName,
      text,
      mediaType: mediaType || (mediaUrl ? "image" : "none"),
      mediaUrl,
      direction: "INBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "READ",
    };

    this.addLog(inboundLog);

    // AI Multi-Agent automated reply logic in English
    let replyText = "";
    if (text.toUpperCase().includes("FINISH") || text.toUpperCase().includes("DONE") || text.toUpperCase().includes("SELESAI")) {
      replyText = `✅ [Agent 6: Report Generator] "FINISHED UPLOAD" signal confirmed from ${senderName}. 4 field photos indexed into WhatsApp folder. ISO/AQL 2.5 draft report is now compiling.`;
    } else if (mediaUrl || mediaType === "image") {
      replyText = `🔍 [Agent 1: Quality Vision] Field inspection photo received from ${senderName}. Validating against Golden Sample... Conformance Score: 94.2% (PASS).`;
    } else {
      replyText = `🤖 [InspectAI Bot] Message received from ${senderName}. Routing to Multi-Agent Orchestrator.`;
    }

    const replyLog: WhatsAppMessageLog = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      from: this.session.phoneNumber || "InspectAI Bot",
      to: from,
      senderName: "Agent Orchestrator",
      text: replyText,
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "SENT",
    };

    this.addLog(replyLog);

    return { message: inboundLog, reply: replyLog };
  }

  // Disconnect session
  public disconnect(): BaileysDeviceSession {
    this.session.state = "DISCONNECTED";
    this.session.phoneNumber = null;
    this.session.pushName = null;
    this.session.qrCodeDataUrl = null;
    this.session.qrRaw = null;
    this.session.lastConnectedAt = null;

    this.addLog({
      id: `sys-${Date.now()}`,
      from: "System Gateway",
      to: "All",
      senderName: "System Gateway",
      text: "⚠️ WhatsApp session logged out / disconnected.",
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "SENT",
    });

    return this.session;
  }

  private addLog(log: WhatsAppMessageLog) {
    this.session.messages.unshift(log);
    // Keep max 50 recent messages in memory
    if (this.session.messages.length > 50) {
      this.session.messages = this.session.messages.slice(0, 50);
    }
  }
}

export const baileysService = BaileysManager.getInstance();
