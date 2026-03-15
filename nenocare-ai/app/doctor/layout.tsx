import { CalendarClock, ClipboardCheck, LayoutDashboard, Stethoscope } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Appointments", href: "/doctor/appointments", icon: CalendarClock },
    { label: "Timeslots", href: "/doctor/slots", icon: LayoutDashboard },
    { label: "Exercises", href: "/doctor/exercises", icon: Stethoscope },
    { label: "Reviews", href: "/doctor/review", icon: ClipboardCheck },
  ];

  return (
    <div className="flex min-h-screen gap-6 px-4 py-6">
      <SidebarNav title="Doctor Desk" subtitle="NeroCare" items={items} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
