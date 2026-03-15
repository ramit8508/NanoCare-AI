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

export default async function DoctorAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const prismaAny = prisma as any;
  const appointments = (await prismaAny.appointment.findMany({
    where: { doctorId: session.userId },
    include: { patient: true, slot: true },
    orderBy: { createdAt: "desc" },
  })) as Array<any>;

  const items = appointments.map((appointment) => ({
    id: appointment.id,
    patientEmail: appointment.patient.email,
    startAt: formatDateTime(appointment.slot.startAt),
    endAt: formatDateTime(appointment.slot.endAt),
    status: appointment.status,
    roomId: appointment.roomId,
    startAtIso: new Date(appointment.slot.startAt).toISOString(),
  }));

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Upcoming Appointments</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Join sessions and review patient needs before the call.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-mutedForeground">No appointments booked yet.</p>
      ) : (
        <AppointmentListClient
          items={items}
          userId={session.userId}
          userName="Doctor"
        />
      )}
    </main>
  );
}
