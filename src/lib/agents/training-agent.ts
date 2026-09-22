import { prisma } from "../db";
import { callAgentLLM } from "./gemini-client";

export interface CreateModuleInput {
  title: string;
  category: string;
  sampleReportText: string;
  clientRequirements: string;
}

export interface QuizSubmissionInput {
  inspectorId: string;
  moduleId: string;
  selectedAnswers: number[]; // Array of selected option indices
}

export async function createTrainingModuleFromSpecs(input: CreateModuleInput) {
  const systemPrompt = `You are an AI Training Academy Agent responsible for creating interactive video training modules from client specifications, QA inspection templates, and sample reports.
Generate structured training modules with a 3-question competency quiz testing inspector understanding.
Output JSON:
{
  "description": string,
  "durationSeconds": number,
  "requirementsData": { "summary": string, "keyCheckpoints": string[] },
  "quizQuestions": [
    {
      "question": string,
      "options": string[],
      "correctIndex": number
    }
  ]
}`;

  const userPrompt = `Module Title: ${input.title}
Category: ${input.category}
Client Requirements: ${input.clientRequirements}
Sample Report Context: ${input.sampleReportText}`;

  const fallbackData = {
    description: `Comprehensive technical training module for ${input.title}. Covers visual AQL 2.5 standards, dimensional tolerances, and WhatsApp photo audit protocols.`,
    durationSeconds: 180,
    requirementsData: {
      summary: "Ensures all certified field inspectors understand critical, major, and minor defect thresholds.",
      keyCheckpoints: [
        "Pantone & master swatch color verification",
        "Chest & sleeve dimensional tolerance testing (+/- 0.5cm)",
        "Document photo capture and checklist completeness",
      ],
    },
    quizQuestions: [
      {
        question: "What is the maximum permissible dimensional tolerance deviation under standard AQL specifications?",
        options: ["+/- 0.5 cm", "+/- 2.0 cm", "+/- 5.0 cm", "At the discretion of the factory"],
        correctIndex: 0,
      },
      {
        question: "When is the inspector required to send the 'Finished Upload' confirmation to the WhatsApp AI Agent?",
        options: [
          "Prior to arriving at the factory floor",
          "After all mandatory photo angles and dimension/weight data have been completely uploaded",
          "Upon returning to the central office",
          "Confirmation is optional",
        ],
        correctIndex: 1,
      },
      {
        question: "How should an inspector handle a defect observed on a product care label?",
        options: [
          "Ignore if the quantity is minimal",
          "Capture high-resolution macro photos and document in the minor defect log",
          "Reject the entire container immediately without an inspection report",
          "Replace the label on-site manually",
        ],
        correctIndex: 1,
      },
    ],
  };

  const { data } = await callAgentLLM<typeof fallbackData>({
    systemPrompt,
    userPrompt,
    fallbackResponse: fallbackData,
  });

  const moduleRecord = await prisma.trainingModule.create({
    data: {
      title: input.title,
      description: data.description,
      category: input.category,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationSeconds: data.durationSeconds || 180,
      requirementsData: data.requirementsData as any,
      quizQuestions: data.quizQuestions as any,
      passingScore: 80,
    },
  });

  return moduleRecord;
}

export async function recordVideoWatchTelemetry(
  inspectorId: string,
  moduleId: string,
  currentWatchedSeconds: number,
  hasSkippedOrSeeked: boolean
) {
  const moduleRecord = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
  });

  if (!moduleRecord) throw new Error("Module not found");

  const existing = await prisma.trainingProgress.findUnique({
    where: {
      inspectorId_moduleId: {
        inspectorId,
        moduleId,
      },
    },
  });

  // Anti-skip enforcement logic
  const validSeconds = hasSkippedOrSeeked
    ? existing?.watchTimeSeconds || 0
    : Math.min(
        moduleRecord.durationSeconds,
        Math.max(existing?.watchTimeSeconds || 0, currentWatchedSeconds)
      );

  const isCompletedWatch = validSeconds >= moduleRecord.durationSeconds - 2;

  const progress = await prisma.trainingProgress.upsert({
    where: {
      inspectorId_moduleId: {
        inspectorId,
        moduleId,
      },
    },
    update: {
      watchTimeSeconds: validSeconds,
    },
    create: {
      inspectorId,
      moduleId,
      watchTimeSeconds: validSeconds,
      isCompleted: false,
    },
  });

  return {
    progress,
    isEligibleForQuiz: isCompletedWatch,
    antiSkipWarning: hasSkippedOrSeeked
      ? "Anti-Skip Security Alert: Fast-forwarding or scrubbing detected. Telemetry watch time was not recorded."
      : null,
  };
}

export async function submitQuizAndCertify(input: QuizSubmissionInput) {
  const moduleRecord = await prisma.trainingModule.findUnique({
    where: { id: input.moduleId },
  });

  if (!moduleRecord) throw new Error("Module not found");

  const quizQuestions = moduleRecord.quizQuestions as Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;

  let correctCount = 0;
  quizQuestions.forEach((q, idx) => {
    if (input.selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
  const isPassed = scorePercentage >= moduleRecord.passingScore;

  const certNumber = isPassed
    ? `CERT-INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    : null;

  const updatedProgress = await prisma.trainingProgress.update({
    where: {
      inspectorId_moduleId: {
        inspectorId: input.inspectorId,
        moduleId: input.moduleId,
      },
    },
    data: {
      isCompleted: isPassed,
      quizScore: scorePercentage,
      certificateNumber: certNumber,
      certificateUrl: certNumber ? `/certificates/${certNumber}.pdf` : null,
      completedAt: isPassed ? new Date() : null,
    },
    include: {
      inspector: true,
      module: true,
    },
  });

  return {
    isPassed,
    scorePercentage,
    passingScore: moduleRecord.passingScore,
    certificateNumber: certNumber,
    progress: updatedProgress,
    message: isPassed
      ? `Congratulations! You passed with a score of ${scorePercentage}%. Digital Certificate of Competency has been issued.`
      : `Your score is ${scorePercentage}%. Minimum required passing score is ${moduleRecord.passingScore}%. Please review the video module and retry.`,
  };
}
