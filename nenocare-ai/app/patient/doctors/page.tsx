import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { bookSlot } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatDateTime = (value: Date) =>
  value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function PatientDoctorsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/login");
  }

  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR", isBlacklisted: false },
    include: { doctorProfile: true },
    orderBy: { createdAt: "desc" },
  });

  const prismaAny = prisma as any;
  const slots = (await prismaAny.doctorSlot.findMany({
    where: { status: "AVAILABLE", startAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
  })) as Array<any>;

  const slotsByDoctor = new Map<string, typeof slots>();
  slots.forEach((slot: any) => {
    const list = slotsByDoctor.get(slot.doctorId) || [];
    list.push(slot);
    slotsByDoctor.set(slot.doctorId, list);
  });

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Book a Doctor</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Choose a physiotherapist and reserve a consultation slot.
        </p>
      </div>

      <section className="mt-6 grid gap-6">
        {doctors.length === 0 ? (
          <p className="text-sm text-mutedForeground">No doctors available.</p>
        ) : (
          doctors.map((doctor) => {
            const doctorSlots = slotsByDoctor.get(doctor.id) || [];
            return (
              <Card key={doctor.id} className="glass">
                <CardHeader>
                  <CardTitle>{doctor.email}</CardTitle>
                  <p className="text-sm text-mutedForeground">
                    {doctor.doctorProfile?.degrees || "Physiotherapist"} · {doctor.doctorProfile?.experienceYears ?? 0} yrs
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-mutedForeground">
                    {doctor.doctorProfile?.bio || "Expert in recovery-focused programs."}
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patient/doctors/${doctor.id}`}>View profile</Link>
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {doctorSlots.length === 0 ? (
                      <p className="text-xs text-mutedForeground">No open slots.</p>
                    ) : (
                      doctorSlots.map((slot: any) => (
                        <form
                          key={slot.id}
                          action={bookSlot}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="text-sm">
                            {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                          </div>
                          <input type="hidden" name="slotId" value={slot.id} />
                          <Button type="submit" size="sm">
                            Book Slot
                          </Button>
                        </form>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}
