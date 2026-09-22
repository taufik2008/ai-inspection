import { NextResponse } from "next/server";
import { baileysService } from "@/lib/whatsapp/baileys-service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, phoneNumber, pushName } = body;

    // Direct pairing simulation or real socket init
    if (action === "pair_now") {
      const session = baileysService.simulatePairSuccess(
        phoneNumber || "+62 812-9876-5432",
        pushName || "InspectAI Operations Hub"
      );
      return NextResponse.json({ success: true, data: session });
    }

    // Default: generate fresh QR code for camera scan
    const session = await baileysService.initSession();
    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate Baileys session" },
      { status: 500 }
    );
  }
}
