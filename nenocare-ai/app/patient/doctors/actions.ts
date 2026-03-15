"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const requirePatient = async () => {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    throw new Error("Unauthorized");
  }
  return session;
};

export async function bookSlot(formData: FormData) {
  const session = await requirePatient();
  const slotId = String(formData.get("slotId") || "");

  if (!slotId) {
    throw new Error("Missing slotId");
  }

  const prismaAny = prisma as any;
  const slot = await prismaAny.doctorSlot.findFirst({
    where: { id: slotId, status: "AVAILABLE" },
  });

  if (!slot) {
    throw new Error("Slot unavailable");
  }

  const roomId = randomBytes(10).toString("hex");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const meetingUrl = `${baseUrl}/meet/${roomId}`;

  await prismaAny.doctorSlot.update({
    where: { id: slot.id },
    data: { status: "BOOKED" },
  });

  await prismaAny.appointment.create({
    data: {
      doctorId: slot.doctorId,
      patientId: session.userId,
      slotId: slot.id,
      roomId,
      meetingUrl,
    },
  });

  revalidatePath("/patient/doctors");
  revalidatePath("/patient/appointments");
}
