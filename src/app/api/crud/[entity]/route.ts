import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role, InspectorStatus, JobStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;

    switch (entity) {
      case "clients": {
        const clients = await prisma.client.findMany({
          include: { _count: { select: { inspectionJobs: true, quotations: true } } },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, data: clients });
      }

      case "inspectors":
      case "users": {
        const users = await prisma.user.findMany({
          include: {
            _count: { select: { inspectionJobs: true, trainingProgress: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, data: users });
      }

      case "jobs": {
        const jobs = await prisma.inspectionJob.findMany({
          include: {
            client: true,
            inspector: true,
            artifacts: true,
            reports: true,
          },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, data: jobs });
      }

      default:
        return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const body = await req.json();

    switch (entity) {
      case "clients": {
        const newClient = await prisma.client.create({
          data: {
            name: body.name,
            company: body.company,
            email: body.email,
            phone: body.phone,
            address: body.address || null,
          },
        });
        return NextResponse.json({ success: true, data: newClient });
      }

      case "inspectors":
      case "users": {
        const newUser = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            role: (body.role as Role) || Role.INSPECTOR,
            phone: body.phone || null,
            avatar: body.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            status: (body.status as InspectorStatus) || InspectorStatus.AVAILABLE,
            skills: body.skills || ["Quality Inspection", "AQL 2.5"],
          },
        });
        return NextResponse.json({ success: true, data: newUser });
      }

      case "jobs": {
        const count = await prisma.inspectionJob.count();
        const jobCode = `INSP-${new Date().getFullYear()}-JOB-${String(count + 1).padStart(3, "0")}`;
        const newJob = await prisma.inspectionJob.create({
          data: {
            jobCode,
            title: body.title,
            clientId: body.clientId,
            inspectorId: body.inspectorId || null,
            scheduledDate: new Date(body.scheduledDate || Date.now()),
            location: body.location,
            status: (body.status as JobStatus) || JobStatus.SCHEDULED,
            requirements: body.requirements || { standard: "AQL 2.5", minPhotoCount: 6 },
            goldenSampleNotes: body.goldenSampleNotes || "Standard client specifications",
            goldenSampleImages: body.goldenSampleImages || [
              "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
            ],
          },
          include: { client: true, inspector: true },
        });
        return NextResponse.json({ success: true, data: newJob });
      }

      default:
        return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: "Missing entity ID" }, { status: 400 });

    switch (entity) {
      case "clients": {
        const updated = await prisma.client.update({
          where: { id },
          data: {
            name: data.name,
            company: data.company,
            email: data.email,
            phone: data.phone,
            address: data.address,
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "inspectors":
      case "users": {
        const updated = await prisma.user.update({
          where: { id },
          data: {
            name: data.name,
            email: data.email,
            role: data.role as Role,
            phone: data.phone,
            status: data.status as InspectorStatus,
            skills: data.skills,
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "jobs": {
        const updated = await prisma.inspectionJob.update({
          where: { id },
          data: {
            title: data.title,
            clientId: data.clientId,
            inspectorId: data.inspectorId || null,
            scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
            location: data.location,
            status: data.status as JobStatus,
            goldenSampleNotes: data.goldenSampleNotes,
          },
          include: { client: true, inspector: true },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      default:
        return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 });

    switch (entity) {
      case "clients": {
        await prisma.client.delete({ where: { id } });
        return NextResponse.json({ success: true, deletedId: id });
      }

      case "inspectors":
      case "users": {
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true, deletedId: id });
      }

      case "jobs": {
        await prisma.inspectionJob.delete({ where: { id } });
        return NextResponse.json({ success: true, deletedId: id });
      }

      default:
        return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
