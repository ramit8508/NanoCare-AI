import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExerciseSession from "./ExerciseSession";
import { createSessionReport } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PrescriptionWithDoctor = Prisma.ExercisePrescriptionGetPayload<{
  include: { doctor: true };
}>;

export default async function PatientExercisesPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/login");
  }

  const prescriptions = (await prisma.exercisePrescription.findMany({
    where: { patientId: session.userId },
    include: { doctor: true },
    orderBy: { createdAt: "desc" },
  })) as PrescriptionWithDoctor[];

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Your Prescribed Exercises</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Follow your personalized program and track your recovery.
        </p>
      </div>
      {prescriptions.length === 0 ? (
        <p className="mt-6 text-sm text-mutedForeground">
          No exercises have been prescribed yet.
        </p>
      ) : (
        prescriptions.map((item) => (
          <Card key={item.id} className="glass card-lift mt-6">
            <CardHeader>
              <CardTitle>{item.name || "Exercise"}</CardTitle>
              <p className="text-sm text-mutedForeground">
                Prescribed by: {item.doctor.email}
              </p>
            </CardHeader>
            <CardContent>
              <ExerciseSession
                prescriptionId={item.id}
                exerciseName={item.name || "Exercise"}
                exerciseGif={item.gifUrl || undefined}
                onUploadComplete={(url) => {
                  console.log("Uploaded session video:", url);
                }}
                onGenerateReport={createSessionReport}
              />
            </CardContent>
          </Card>
        ))
      )}
    </main>
  );
}
