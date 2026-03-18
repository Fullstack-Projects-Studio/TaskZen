"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  MoreHorizontal,
  BookOpen,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/monthly", label: "Calendar", icon: CalendarDays },
] as const;

const moreItems = [
  { href: "/reflect", label: "Reflect", icon: BookOpen },
  { href: "/routine", label: "Routine", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const activeTab = tabs.find(
    (tab) => pathname === tab.href || pathname.startsWith(tab.href + "/")
  );
  const activeId = activeTab?.href ?? (isMoreActive ? "more" : null);

  return (
    <>
      {/* Backdrop overlay when More popover is open */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More popover */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="fixed bottom-[4.5rem] right-3 z-50 w-44 rounded-xl border bg-card p-1.5 shadow-xl md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {moreItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <motion.nav
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              >
                {isActive && activeId === tab.href && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 rounded-b-full bg-primary"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.5,
                    }}
                  />
                )}
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          >
            {isMoreActive && activeId === "more" && (
              <motion.div
                layoutId="bottomTabIndicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 rounded-b-full bg-primary"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.5,
                }}
              />
            )}
            <MoreHorizontal
              className={cn(
                "h-5 w-5 transition-colors",
                isMoreActive || moreOpen
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isMoreActive || moreOpen
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              More
            </span>
          </button>
        </div>
      </motion.nav>
    </>
  );
}
