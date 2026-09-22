import { NextResponse } from "next/server";
import { baileysService } from "@/lib/whatsapp/baileys-service";

export async function POST() {
  try {
    const session = await baileysService.disconnect();
    return NextResponse.json({
      success: true,
      message: "Disconnected from WhatsApp Baileys session",
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
