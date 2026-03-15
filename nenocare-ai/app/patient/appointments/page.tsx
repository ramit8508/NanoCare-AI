import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppointmentListClient from "./AppointmentListClient";

const formatDateTime = (value: Date) =>
  value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function PatientAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/login");
  }

  const prismaAny = prisma as any;
  const appointments = (await prismaAny.appointment.findMany({
    where: { patientId: session.userId },
    include: { doctor: true, slot: true },
    orderBy: { createdAt: "desc" },
  })) as Array<any>;

  const items = appointments.map((appointment) => ({
    id: appointment.id,
    doctorEmail: appointment.doctor.email,
    startAt: formatDateTime(appointment.slot.startAt),
    endAt: formatDateTime(appointment.slot.endAt),
    status: appointment.status,
    roomId: appointment.roomId,
    startAtIso: new Date(appointment.slot.startAt).toISOString(),
  }));

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Your Appointments</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Join your telehealth sessions when they start.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-mutedForeground">No appointments yet.</p>
      ) : (
        <AppointmentListClient
          items={items}
          userId={session.userId}
          userName="Patient"
        />
      )}
    </main>
  );
}
