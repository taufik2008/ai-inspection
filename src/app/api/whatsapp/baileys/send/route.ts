import { NextResponse } from "next/server";
import { baileysService } from "@/lib/whatsapp/baileys-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, to, text, senderName, from, mediaUrl, mediaType } = body;

    // Mode A: Simulate / Process inbound field inspector message
    if (action === "inbound_field_upload") {
      const result = await baileysService.processInboundFieldMessage(
        from || "+62 812-9876-1122",
        senderName || "Arief Hidayat (Inspector)",
        text || "SELESAI KIRIM batch 1 foto inspeksi",
        mediaUrl,
        mediaType
      );
      return NextResponse.json({ success: true, data: result });
    }

    // Mode B: Send outbound text / broadcast
    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: "Missing 'to' or 'text' fields" },
        { status: 400 }
      );
    }

    const log = await baileysService.sendTextMessage(to, text, senderName || "InspectAI Dispatch Bot");

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}
