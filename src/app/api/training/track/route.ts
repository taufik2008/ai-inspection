import { NextRequest, NextResponse } from "next/server";
import { AgentsOrchestrator } from "@/lib/agents/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inspectorId, moduleId, currentWatchedSeconds, hasSkippedOrSeeked } = body;

    if (!inspectorId || !moduleId) {
      return NextResponse.json({ error: "Missing inspectorId or moduleId" }, { status: 400 });
    }

    const result = await AgentsOrchestrator.agent5Training.recordTelemetry(
      inspectorId,
      moduleId,
      Number(currentWatchedSeconds) || 0,
      Boolean(hasSkippedOrSeeked)
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Training telemetry error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
