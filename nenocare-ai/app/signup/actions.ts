"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function createPatientAccount(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();

  if (!email || !password) {
    throw new Error("Missing required fields");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      role: "PATIENT",
      patientProfile: {
        create: {
          displayName: displayName || undefined,
        },
      },
    },
  });

  redirect("/login");
}
