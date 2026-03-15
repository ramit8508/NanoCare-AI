import { LayoutDashboard, ShieldCheck } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Access Control", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen gap-6 px-4 py-6">
      <SidebarNav title="Admin Console" subtitle="NeroCare" items={items} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
