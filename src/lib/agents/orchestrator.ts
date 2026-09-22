import { runInspectionQualityAgent } from "./inspection-quality-agent";
import { checkInspectorAvailability, createAndScheduleInspection, broadcastHMinusOneReminders } from "./scheduling-agent";
import { generateRFQQuotationDraft, approveQuotationByManager, sendQuotationToClient } from "./rfq-quotation-agent";
import { generateMarketingDraft, approveAndPublishMarketingPost } from "./marketing-agent";
import { createTrainingModuleFromSpecs, recordVideoWatchTelemetry, submitQuizAndCertify } from "./training-agent";
import { ingestWhatsAppDocuments, getStructuredFolderHierarchy, generateDetailedInspectionReport, approveInspectionReport } from "./document-report-agent";

export const AgentsOrchestrator = {
  // Agent 1: Inspection Quality & Completeness
  agent1Quality: {
    validateFieldInspectionImages: runInspectionQualityAgent,
  },

  // Agent 2: Scheduling & Calendar
  agent2Scheduling: {
    checkAvailability: checkInspectorAvailability,
    createSchedule: createAndScheduleInspection,
    broadcastReminders: broadcastHMinusOneReminders,
  },

  // Agent 3: RFQ & Quotations
  agent3Quotation: {
    generateDraft: generateRFQQuotationDraft,
    approveByManager: approveQuotationByManager,
    sendToClient: sendQuotationToClient,
  },

  // Agent 4: Marketing Studio
  agent4Marketing: {
    generateDraft: generateMarketingDraft,
    approveAndPublish: approveAndPublishMarketingPost,
  },

  // Agent 5: Training Academy
  agent5Training: {
    createModule: createTrainingModuleFromSpecs,
    recordTelemetry: recordVideoWatchTelemetry,
    submitQuiz: submitQuizAndCertify,
  },

  // Agent 6: Document Process & Report Generator
  agent6DocumentReport: {
    ingestWhatsApp: ingestWhatsAppDocuments,
    getFolderHierarchy: getStructuredFolderHierarchy,
    generateReport: generateDetailedInspectionReport,
    approveReport: approveInspectionReport,
  },
};
