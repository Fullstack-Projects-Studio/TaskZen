"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className="flex flex-col min-h-screen transition-[padding] duration-200 ease-in-out md:pl-[var(--sidebar-width)]"
      style={{ "--sidebar-width": collapsed ? "68px" : "256px" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
