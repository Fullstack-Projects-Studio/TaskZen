"use client";

import { createContext, useContext } from "react";
import { useNotifications } from "@/hooks/use-notifications";

type NotificationContextValue = ReturnType<typeof useNotifications>;

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return ctx;
}
