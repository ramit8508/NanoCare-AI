import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createDoctor, setBlacklist } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DoctorWithProfile = Prisma.UserGetPayload<{
  include: { doctorProfile: true };
}>;

type PatientWithProfile = Prisma.UserGetPayload<{
  include: { patientProfile: true };
}>;

const requireAdminPage = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
};

export default async function AdminPage() {
  await requireAdminPage();

  const [doctors, patients] = (await Promise.all([
    prisma.user.findMany({
      where: { role: "DOCTOR" },
      include: { doctorProfile: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "PATIENT" },
      include: { patientProfile: true },
      orderBy: { createdAt: "desc" },
    }),
  ])) as [DoctorWithProfile[], PatientWithProfile[]];

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Manage doctors and patients from one control center.
        </p>
      </div>

      <Card className="glass mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Create Doctor Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDoctor} className="grid gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3"
            />
            <input
              name="password"
              type="password"
              placeholder="Temporary password"
              required
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3"
            />
            <input
              name="degrees"
              type="text"
              placeholder="Degrees (BPT/MPT)"
              required
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3"
            />
            <input
              name="experienceYears"
              type="number"
              placeholder="Experience years"
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3"
            />
            <textarea
              name="bio"
              placeholder="Short bio"
              rows={3}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            />
            <Button type="submit">Create Doctor</Button>
          </form>
        </CardContent>
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{doctor.email}</p>
                  <p className="text-xs text-mutedForeground">
                    {doctor.doctorProfile?.degrees || "-"} · {doctor.doctorProfile?.experienceYears ?? "-"} yrs
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-mutedForeground">
                    {doctor.isBlacklisted ? "Blocked" : "Active"}
                  </span>
                  <form action={setBlacklist}>
                    <input type="hidden" name="userId" value={doctor.id} />
                    <input
                      type="hidden"
                      name="action"
                      value={doctor.isBlacklisted ? "unblock" : "block"}
                    />
                    <Button type="submit" size="sm" variant="outline">
                      {doctor.isBlacklisted ? "Unblock" : "Block"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{patient.email}</p>
                  <p className="text-xs text-mutedForeground">
                    {patient.patientProfile?.displayName || "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-mutedForeground">
                    {patient.isBlacklisted ? "Blocked" : "Active"}
                  </span>
                  <form action={setBlacklist}>
                    <input type="hidden" name="userId" value={patient.id} />
                    <input
                      type="hidden"
                      name="action"
                      value={patient.isBlacklisted ? "unblock" : "block"}
                    />
                    <Button type="submit" size="sm" variant="outline">
                      {patient.isBlacklisted ? "Unblock" : "Block"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
