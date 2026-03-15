import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExerciseLibrary from "./ExerciseLibrary";
import { createPrescription } from "./actions";

type PatientUser = Prisma.UserGetPayload<{}>;

export default async function DoctorExercisesPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const patients = (await prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
  })) as PatientUser[];

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    label: patient.email,
  }));

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Exercise Library</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Search exercises and prescribe to a patient.
        </p>
      </div>
      <ExerciseLibrary
        patients={patientOptions}
        createPrescription={createPrescription}
      />
    </main>
  );
}
