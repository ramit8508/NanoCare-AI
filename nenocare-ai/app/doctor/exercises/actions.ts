"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const requireDoctor = async () => {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    throw new Error("Unauthorized");
  }
  return session;
};

export async function createPrescription(formData: FormData) {
  const session = await requireDoctor();

  const patientId = String(formData.get("patientId") || "");
  const exerciseId = String(formData.get("exerciseId") || "");
  const name = String(formData.get("name") || "");
  const gifUrl = String(formData.get("gifUrl") || "");
  const bodyPart = String(formData.get("bodyPart") || "");
  const target = String(formData.get("target") || "");

  if (!patientId || !exerciseId) {
    throw new Error("Missing required fields");
  }

  await prisma.exercisePrescription.create({
    data: {
      doctorId: session.userId,
      patientId,
      exerciseId,
      name,
      gifUrl,
      bodyPart,
      target,
    },
  });

  revalidatePath("/doctor/exercises");
}
