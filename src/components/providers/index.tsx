"use client";

import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { SidebarProvider } from "./sidebar-provider";
import { NotificationProvider } from "./notification-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryProvider>
          <NotificationProvider>
            <SidebarProvider>
              <TooltipProvider>
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </SidebarProvider>
          </NotificationProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
