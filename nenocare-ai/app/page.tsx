import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "Patient",
    description: "Start recovery, book sessions, and track progress.",
    href: "/login",
    secondary: "/signup",
    secondaryLabel: "Sign up",
  },
  {
    title: "Doctor",
    description: "Manage timeslots, prescriptions, and reviews.",
    href: "/doctor/login",
  },
  {
    title: "Admin",
    description: "Control access and onboard doctors.",
    href: "/admin/login",
  },
];

export default function HomePage() {
  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-300">
            NeroCare AI
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Modern Clinical Care for Physio Recovery
          </h1>
          <p className="mt-4 text-sm text-mutedForeground">
            Book sessions, prescribe exercises, and analyze outcomes with AI.
          </p>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.title} className="glass card-lift">
              <CardHeader>
                <CardTitle>{role.title}</CardTitle>
                <p className="text-sm text-mutedForeground">
                  {role.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild>
                  <a href={role.href}>Continue</a>
                </Button>
                {role.secondary ? (
                  <Button asChild variant="outline">
                    <a href={role.secondary}>{role.secondaryLabel}</a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
