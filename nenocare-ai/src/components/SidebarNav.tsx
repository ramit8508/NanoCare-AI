"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type Props = {
  title: string;
  subtitle: string;
  items: NavItem[];
};

export default function SidebarNav({ title, subtitle, items }: Props) {
  const pathname = usePathname();

  return (
    <aside className="glass flex h-full w-64 flex-col gap-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300">{subtitle}</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-sky-500/15 text-sky-200" : "text-mutedForeground hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-xs text-mutedForeground">
        NeroCare AI · Modern Clinical
      </div>
    </aside>
  );
}
