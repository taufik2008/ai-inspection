import { NextRequest, NextResponse } from "next/server";
import { AgentsOrchestrator } from "@/lib/agents/orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await req.json();

    switch (agentId) {
      case "1":
      case "quality": {
        const result = await AgentsOrchestrator.agent1Quality.validateFieldInspectionImages(body);
        return NextResponse.json({ success: true, agent: 1, result });
      }

      case "2":
      case "scheduling": {
        if (body.action === "broadcast_reminders") {
          const result = await AgentsOrchestrator.agent2Scheduling.broadcastReminders();
          return NextResponse.json({ success: true, agent: 2, action: "broadcast_reminders", result });
        }
        if (body.action === "check_availability") {
          const result = await AgentsOrchestrator.agent2Scheduling.checkAvailability(new Date(body.targetDate));
          return NextResponse.json({ success: true, agent: 2, action: "check_availability", result });
        }
        const result = await AgentsOrchestrator.agent2Scheduling.createSchedule(body);
        return NextResponse.json({ success: true, agent: 2, result });
      }

      case "3":
      case "rfq": {
        if (body.action === "approve") {
          const result = await AgentsOrchestrator.agent3Quotation.approveByManager(body.quotationId, body.managerNotes);
          return NextResponse.json({ success: true, agent: 3, action: "approve", result });
        }
        if (body.action === "send_to_client") {
          const result = await AgentsOrchestrator.agent3Quotation.sendToClient(body.quotationId);
          return NextResponse.json({ success: true, agent: 3, action: "send_to_client", result });
        }
        const result = await AgentsOrchestrator.agent3Quotation.generateDraft(body);
        return NextResponse.json({ success: true, agent: 3, result });
      }

      case "4":
      case "marketing": {
        if (body.action === "approve") {
          const result = await AgentsOrchestrator.agent4Marketing.approveAndPublish(body.postId);
          return NextResponse.json({ success: true, agent: 4, action: "approve", result });
        }
        const result = await AgentsOrchestrator.agent4Marketing.generateDraft(body);
        return NextResponse.json({ success: true, agent: 4, result });
      }

      case "5":
      case "training": {
        if (body.action === "create_module") {
          const result = await AgentsOrchestrator.agent5Training.createModule(body);
          return NextResponse.json({ success: true, agent: 5, action: "create_module", result });
        }
        if (body.action === "submit_quiz") {
          const result = await AgentsOrchestrator.agent5Training.submitQuiz(body);
          return NextResponse.json({ success: true, agent: 5, action: "submit_quiz", result });
        }
        const result = await AgentsOrchestrator.agent5Training.recordTelemetry(
          body.inspectorId,
          body.moduleId,
          body.currentWatchedSeconds,
          body.hasSkippedOrSeeked
        );
        return NextResponse.json({ success: true, agent: 5, result });
      }

      case "6":
      case "document-report": {
        if (body.action === "ingest") {
          const result = await AgentsOrchestrator.agent6DocumentReport.ingestWhatsApp(body.jobId, body.files);
          return NextResponse.json({ success: true, agent: 6, action: "ingest", result });
        }
        if (body.action === "folder_tree") {
          const result = await AgentsOrchestrator.agent6DocumentReport.getFolderHierarchy(body.jobId);
          return NextResponse.json({ success: true, agent: 6, action: "folder_tree", result });
        }
        if (body.action === "approve_report") {
          const result = await AgentsOrchestrator.agent6DocumentReport.approveReport(body.reportId);
          return NextResponse.json({ success: true, agent: 6, action: "approve_report", result });
        }
        const result = await AgentsOrchestrator.agent6DocumentReport.generateReport(body.jobId);
        return NextResponse.json({ success: true, agent: 6, result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown agent identifier '${agentId}'. Valid: 1..6 or name.` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Agent invocation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process agent request" },
      { status: 500 }
    );
  }
}
