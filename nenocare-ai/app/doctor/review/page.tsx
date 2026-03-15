import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DoctorReviewClient from "./DoctorReviewClient";

export default async function DoctorReviewPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const prismaAny = prisma as any;
  const records = (await prismaAny.exerciseSessionRecord.findMany({
    where: { doctorId: session.userId, reportText: { not: null } },
    include: { patient: true, prescription: true },
    orderBy: { createdAt: "desc" },
  })) as Array<any>;

  const patients = (await prismaAny.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
  })) as Array<any>;

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    label: patient.email,
  }));

  const reviewRecords = records.map((record) => ({
    id: record.id,
    patientId: record.patientId,
    patientEmail: record.patient.email,
    exerciseName: record.prescription?.name || "Exercise",
    repCount: record.repCount ?? null,
    accuracy: record.accuracy ?? null,
    maxAngle: record.maxAngle ?? null,
    videoUrl: record.videoUrl,
    reportText: record.reportText ?? null,
  }));

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Patient Reviews</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Review recordings alongside Groq clinical analysis.
        </p>
      </div>
      {reviewRecords.length === 0 ? (
        <p className="mt-6 text-sm text-mutedForeground">No reports yet.</p>
      ) : (
        <DoctorReviewClient patients={patientOptions} records={reviewRecords} />
      )}
    </main>
  );
}
