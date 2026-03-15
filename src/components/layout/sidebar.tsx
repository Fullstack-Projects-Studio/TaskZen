"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Settings,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/monthly", label: "Monthly", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <motion.aside
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50"
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex flex-col flex-grow bg-card border-r overflow-y-auto">
        <div className="flex items-center gap-2 px-4 py-5 border-b min-h-[68px]">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex-shrink-0"
            onClick={collapsed ? toggle : undefined}
            style={collapsed ? { cursor: "pointer" } : undefined}
          >
            <CheckSquare className="h-7 w-7 text-primary" />
          </motion.div>
          {!collapsed && (
            <>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold whitespace-nowrap overflow-hidden flex-1"
              >
                TaskZen
              </motion.h1>
              <button
                onClick={toggle}
                className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
              >
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger render={linkContent} />
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </motion.div>
            );
          })}
        </nav>

      </div>
    </motion.aside>
  );
}
