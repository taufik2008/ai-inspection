import { NextResponse } from "next/server";
import { baileysService } from "@/lib/whatsapp/baileys-service";

export async function GET() {
  try {
    const session = await baileysService.getSession();
    const envUrl = process.env.BAILEYS_SERVER_URL || process.env.NEXT_PUBLIC_BAILEYS_SERVER_URL || "";
    return NextResponse.json({
      success: true,
      data: session,
      debug: {
        hasEnvUrl: !!envUrl,
        configuredUrl: envUrl ? `${envUrl.substring(0, 12)}...` : "(none)",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get Baileys status" },
      { status: 500 }
    );
  }
}
