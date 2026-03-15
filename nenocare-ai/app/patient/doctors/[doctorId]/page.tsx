import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { bookSlot } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatDate = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

const formatTime = (value: Date) =>
  value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function DoctorProfilePage({
  params,
}: {
  params: { doctorId: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/login");
  }

  const doctor = await prisma.user.findFirst({
    where: { id: params.doctorId, role: "DOCTOR", isBlacklisted: false },
    include: { doctorProfile: true },
  });

  if (!doctor) {
    redirect("/patient/doctors");
  }

  const prismaAny = prisma as any;
  const slots = (await prismaAny.doctorSlot.findMany({
    where: {
      doctorId: doctor.id,
      status: "AVAILABLE",
      startAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
  })) as Array<any>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });

  return (
    <main className="px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Doctor Profile</p>
          <h1 className="mt-2 text-3xl font-semibold">{doctor.email}</h1>
          <p className="mt-1 text-sm text-mutedForeground">
            {doctor.doctorProfile?.degrees || "Physiotherapist"} · {doctor.doctorProfile?.experienceYears ?? 0} yrs
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/patient/doctors">Back to list</Link>
        </Button>
      </div>

      <Card className="glass mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <p className="text-sm text-mutedForeground">
            {doctor.doctorProfile?.bio || "Focused on personalized recovery plans."}
          </p>
        </CardHeader>
      </Card>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Available Timeslots</h2>
        <p className="mt-2 text-sm text-mutedForeground">
          Select a slot below to schedule your session.
        </p>

        {slots.length === 0 ? (
          <p className="mt-4 text-sm text-mutedForeground">No open slots.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {days.map((day) => {
              const dayLabel = formatDate(day);
              const daySlots = slots.filter((slot) => {
                const slotDate = new Date(slot.startAt);
                return (
                  slotDate.getFullYear() === day.getFullYear() &&
                  slotDate.getMonth() === day.getMonth() &&
                  slotDate.getDate() === day.getDate()
                );
              });

              return (
                <Card key={day.toISOString()} className="glass">
                  <CardHeader>
                    <CardTitle>{dayLabel}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-mutedForeground">No slots</p>
                    ) : (
                      daySlots.map((slot) => (
                        <form
                          key={slot.id}
                          action={bookSlot}
                          className="card-lift flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="text-sm font-semibold">
                            {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                          </div>
                          <input type="hidden" name="slotId" value={slot.id} />
                          <Button type="submit" size="sm">
                            Book Slot
                          </Button>
                        </form>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
