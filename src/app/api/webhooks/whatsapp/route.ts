import { NextRequest, NextResponse } from "next/server";
import { AgentsOrchestrator } from "@/lib/agents/orchestrator";
import { prisma } from "@/lib/db";

// WhatsApp Cloud API Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN || "INSPECTION_AI_WEBHOOK_SECRET")) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ message: "WhatsApp Webhook Active. Ready for POST payloads." });
}

// WhatsApp Webhook Payload Ingestion (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct payload and WhatsApp Cloud API structured format
    const { jobId, messageText, incomingMedia, isFinishedSignal } = body;

    if (!jobId) {
      // Find latest active job if not supplied
      const latestJob = await prisma.inspectionJob.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (!latestJob) {
        return NextResponse.json({ error: "No active inspection job found." }, { status: 404 });
      }
    }

    const targetJobId =
      jobId ||
      (await prisma.inspectionJob.findFirst({ orderBy: { createdAt: "desc" } }))?.id;

    if (!targetJobId) {
      return NextResponse.json({ error: "No target job identified" }, { status: 400 });
    }

    // 1. If media is attached, ingest via Agent 6
    if (incomingMedia && Array.isArray(incomingMedia) && incomingMedia.length > 0) {
      await AgentsOrchestrator.agent6DocumentReport.ingestWhatsApp(
        targetJobId,
        incomingMedia
      );
    }

    // 2. If inspector sent completion message (e.g. "Selesai Kirim" / "All done")
    const isCompletedMessage =
      isFinishedSignal ||
      (messageText &&
        (messageText.toLowerCase().includes("selesai") ||
          messageText.toLowerCase().includes("done") ||
          messageText.toLowerCase().includes("lengkap")));

    let qualityValidation = null;
    if (isCompletedMessage) {
      qualityValidation = await AgentsOrchestrator.agent1Quality.validateFieldInspectionImages({
        jobId: targetJobId,
        inspectorConfirmedFinished: true,
      });
    }

    return NextResponse.json({
      success: true,
      jobId: targetJobId,
      messageReceived: messageText || "Media uploaded",
      isFinishedSignalAcknowledged: !!isCompletedMessage,
      agent1QualityValidation: qualityValidation,
    });
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
