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

export async function createSlot(formData: FormData) {
  const session = await requireDoctor();

  const startAtRaw = String(formData.get("startAt") || "");
  const endAtRaw = String(formData.get("endAt") || "");

  if (!startAtRaw || !endAtRaw) {
    throw new Error("Missing time range");
  }

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new Error("Invalid time range");
  }

  if (endAt <= startAt) {
    throw new Error("End time must be after start time");
  }

  const prismaAny = prisma as any;
  await prismaAny.doctorSlot.create({
    data: {
      doctorId: session.userId,
      startAt,
      endAt,
    },
  });

  revalidatePath("/doctor/slots");
}
