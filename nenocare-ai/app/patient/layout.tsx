import { Activity, CalendarClock, HeartPulse, LayoutDashboard } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Doctors", href: "/patient/doctors", icon: HeartPulse },
    { label: "Appointments", href: "/patient/appointments", icon: CalendarClock },
    { label: "Exercises", href: "/patient/exercises", icon: LayoutDashboard },
    { label: "Progress", href: "/patient/progress", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen gap-6 px-4 py-6">
      <SidebarNav title="Patient Hub" subtitle="NeroCare" items={items} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
