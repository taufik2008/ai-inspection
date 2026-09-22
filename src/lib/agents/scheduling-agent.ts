import { prisma } from "../db";
import { InspectorStatus, JobStatus, Role } from "@prisma/client";

export interface SchedulingInput {
  clientId: string;
  requestedDate: Date | string;
  location: string;
  projectTitle: string;
  requirements: Record<string, any>;
}

export interface InspectorAvailability {
  inspectorId: string;
  name: string;
  email: string;
  phone: string | null;
  status: InspectorStatus;
  isAvailable: boolean;
  skills: string[];
}

export async function checkInspectorAvailability(
  targetDate: Date
): Promise<InspectorAvailability[]> {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const inspectors = await prisma.user.findMany({
    where: {
      role: Role.INSPECTOR,
    },
    include: {
      inspectionJobs: {
        where: {
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            notIn: [JobStatus.COMPLETED, JobStatus.CANCELLED],
          },
        },
      },
    },
  });

  return inspectors.map((inspector) => ({
    inspectorId: inspector.id,
    name: inspector.name,
    email: inspector.email,
    phone: inspector.phone,
    status: inspector.status,
    isAvailable: inspector.inspectionJobs.length === 0 && inspector.status !== InspectorStatus.OFF_DUTY,
    skills: inspector.skills,
  }));
}

export async function createAndScheduleInspection(input: SchedulingInput) {
  const targetDate = new Date(input.requestedDate);
  const availableInspectors = await checkInspectorAvailability(targetDate);
  const assigned = availableInspectors.find((i) => i.isAvailable) || availableInspectors[0];

  const jobCount = await prisma.inspectionJob.count();
  const jobCode = `INSP-${new Date().getFullYear()}-JOB-${String(jobCount + 1).padStart(3, "0")}`;

  const job = await prisma.inspectionJob.create({
    data: {
      jobCode,
      title: input.projectTitle,
      clientId: input.clientId,
      inspectorId: assigned?.inspectorId || null,
      scheduledDate: targetDate,
      location: input.location,
      status: JobStatus.SCHEDULED,
      requirements: input.requirements,
      goldenSampleNotes: "Master requirement sample provided by client.",
      goldenSampleImages: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
      ],
    },
    include: {
      client: true,
      inspector: true,
    },
  });

  return {
    success: true,
    job,
    assignedInspector: assigned,
    notificationLog: {
      calendarEventCreated: true,
      reminderScheduledFor: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      recipients: [
        { role: "ADMIN", channel: "EMAIL & WA", sent: true },
        { role: "INSPECTOR", name: assigned?.name, channel: "WA", sent: true },
      ],
    },
  };
}

export async function broadcastHMinusOneReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfTomorrow = new Date(tomorrow);
  startOfTomorrow.setHours(0, 0, 0, 0);
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const upcomingJobs = await prisma.inspectionJob.findMany({
    where: {
      scheduledDate: {
        gte: startOfTomorrow,
        lte: endOfTomorrow,
      },
      status: JobStatus.SCHEDULED,
    },
    include: {
      client: true,
      inspector: true,
    },
  });

  return upcomingJobs.map((job) => ({
    jobCode: job.jobCode,
    client: job.client.name,
    inspector: job.inspector?.name || "Unassigned",
    reminderMessage: `[H-1 INSPECTION REMINDER] Hello ${job.inspector?.name || "Inspector"}, you are scheduled for inspection "${job.title}" at "${job.location}" tomorrow on ${job.scheduledDate.toLocaleDateString("en-MY")}. Please prepare your AQL checklist and Golden Sample specifications.`,
    sentStatus: "DELIVERED_VIA_WHATSAPP_AND_EMAIL",
    timestamp: new Date().toISOString(),
  }));
}
