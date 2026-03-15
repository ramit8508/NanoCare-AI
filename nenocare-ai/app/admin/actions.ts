"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const requireAdmin = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
};

export async function createDoctor(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const degrees = String(formData.get("degrees") || "").trim();
  const experienceYearsRaw = String(formData.get("experienceYears") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (!email || !password || !degrees) {
    throw new Error("Missing required fields");
  }

  const experienceYears = experienceYearsRaw
    ? Number(experienceYearsRaw)
    : undefined;

  if (experienceYearsRaw && Number.isNaN(experienceYears)) {
    throw new Error("Experience must be a number");
  }

  const passwordHash = hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "DOCTOR",
      doctorProfile: {
        create: {
          degrees,
          experienceYears,
          bio,
        },
      },
    },
  });

  revalidatePath("/admin");
}

export async function setBlacklist(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const action = String(formData.get("action") || "");

  if (!userId) {
    throw new Error("Missing userId");
  }

  const shouldBlock = action === "block";

  await prisma.user.update({
    where: { id: userId },
    data: { isBlacklisted: shouldBlock },
  });

  revalidatePath("/admin");
}
