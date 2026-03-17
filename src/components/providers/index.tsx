"use client";

import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { SidebarProvider } from "./sidebar-provider";
import { NotificationProvider } from "./notification-provider";
import { FocusProvider } from "./focus-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryProvider>
          <NotificationProvider>
            <FocusProvider>
              <SidebarProvider>
                <TooltipProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </TooltipProvider>
              </SidebarProvider>
            </FocusProvider>
          </NotificationProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
