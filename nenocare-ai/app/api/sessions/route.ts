import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    prescriptionId?: string;
    videoUrl?: string;
    videoPublicId?: string;
    repCount?: number;
  };

  if (!body.prescriptionId || !body.videoUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prescription = await prisma.exercisePrescription.findFirst({
    where: {
      id: body.prescriptionId,
      patientId: session.userId,
    },
  });

  if (!prescription) {
    return NextResponse.json({ error: "Invalid prescription" }, { status: 404 });
  }

  const prismaClient = prisma as any;
  const record = await prismaClient.exerciseSessionRecord.create({
    data: {
      prescriptionId: prescription.id,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      videoUrl: body.videoUrl,
      videoPublicId: body.videoPublicId || undefined,
      repCount: typeof body.repCount === "number" ? body.repCount : undefined,
    },
  });

  return NextResponse.json({ id: record.id });
}
