import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSlot } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatDateTime = (value: Date) =>
  value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

export default async function DoctorSlotsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const prismaAny = prisma as any;
  const slots = (await prismaAny.doctorSlot.findMany({
    where: { doctorId: session.userId },
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
      <div className="max-w-4xl">
        <h1 className="text-3xl font-semibold">Manage Timeslots</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Add your available consultation slots for patients to book.
        </p>
      </div>

      <Card className="glass mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Create new slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSlot} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Start time
              <input
                type="datetime-local"
                name="startAt"
                required
                className="h-11 rounded-md border border-white/10 bg-white/5 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              End time
              <input
                type="datetime-local"
                name="endAt"
                required
                className="h-11 rounded-md border border-white/10 bg-white/5 px-3"
              />
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Add slot</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Weekly Calendar</h2>
        <p className="mt-2 text-sm text-mutedForeground">
          A quick look at your next 7 days.
        </p>

        {slots.length === 0 ? (
          <p className="mt-4 text-sm text-mutedForeground">No slots yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {days.map((day) => {
              const dayLabel = formatDate(day);
              const daySlots = slots.filter((slot: any) => {
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
                      daySlots.map((slot: any) => (
                        <div
                          key={slot.id}
                          className="card-lift flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="text-sm font-semibold">
                            {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                          </div>
                          <p className="text-xs text-mutedForeground">{slot.status}</p>
                          <p className="text-xs text-emerald-300">
                            {slot.status === "AVAILABLE" ? "Open for booking" : "Booked"}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4">
        <h2 className="text-xl font-semibold">All Timeslots</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-mutedForeground">No slots yet.</p>
        ) : (
          slots.map((slot: any) => (
            <Card key={slot.id} className="glass">
              <CardContent className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-mutedForeground">{formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}</p>
                  <p className="text-xs text-mutedForeground">Status: {slot.status}</p>
                </div>
                <div className="text-xs text-emerald-300">
                  {slot.status === "AVAILABLE" ? "Open for booking" : "Booked"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
