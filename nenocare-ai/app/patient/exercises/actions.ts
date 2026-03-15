"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-8b-8192";

const systemPrompt =
  "You are a Senior PT. Analyze this biomechanical data. Write a 3-paragraph clinical report on the patient's performance, highlighting form errors and ROM trends.";

type SessionPayload = {
  prescriptionId: string;
  videoUrl: string;
  videoPublicId?: string;
  accuracy: number;
  reps: number;
  maxAngle: number;
};

const requirePatient = async () => {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    throw new Error("Unauthorized");
  }
  return session;
};

const runGroqReport = async (payload: SessionPayload) => {
  const apiKey = process.env.GROQ_API || "";
  if (!apiKey) {
    throw new Error("Missing GROQ_API");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            accuracy: payload.accuracy,
            reps: payload.reps,
            maxAngle: payload.maxAngle,
            videoUrl: payload.videoUrl,
          }),
        },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq response missing content");
  }

  return content;
};

export async function createSessionReport(payload: SessionPayload) {
  const session = await requirePatient();

  const prescription = await prisma.exercisePrescription.findFirst({
    where: {
      id: payload.prescriptionId,
      patientId: session.userId,
    },
  });

  if (!prescription) {
    throw new Error("Invalid prescription");
  }

  const reportText = await runGroqReport(payload);

  const prismaAny = prisma as any;
  const record = await prismaAny.exerciseSessionRecord.create({
    data: {
      prescriptionId: prescription.id,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      videoUrl: payload.videoUrl,
      videoPublicId: payload.videoPublicId || undefined,
      repCount: payload.reps,
      accuracy: payload.accuracy,
      maxAngle: payload.maxAngle,
      reportText,
    },
  });

  return { id: record.id, reportText };
}
