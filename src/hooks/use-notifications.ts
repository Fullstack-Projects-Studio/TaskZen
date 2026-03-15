"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { isTaskApplicableToday } from "@/lib/notifications";

const STORAGE_KEY = "taskzen-notifications-enabled";
const POLL_INTERVAL = 30_000; // 30 seconds

function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `taskzen-notified-${yyyy}-${mm}-${dd}`;
}

function getNotifiedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markNotified(taskId: string) {
  const ids = getNotifiedIds();
  ids.add(taskId);
  localStorage.setItem(getTodayKey(), JSON.stringify([...ids]));
}

function getCurrentHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: tasks } = useTasks();

  // Hydrate from localStorage + check Notification support
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true" && Notification.permission === "granted") {
      setEnabled(true);
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed — notifications still work, click-to-focus won't
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const toggleEnabled = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
      return;
    }

    // Turning on — ensure permission is granted
    if (Notification.permission !== "granted") {
      const result = await requestPermission();
      if (result !== "granted") return;
    }

    setEnabled(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, [enabled, requestPermission]);

  // Polling loop
  useEffect(() => {
    if (!enabled || !tasks) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    function checkTasks() {
      if (!tasks) return;
      const currentTime = getCurrentHHMM();
      const notifiedIds = getNotifiedIds();

      for (const task of tasks) {
        if (!task.isActive) continue;
        if (!task.scheduledTime) continue;
        if (task.scheduledTime !== currentTime) continue;
        if (notifiedIds.has(task.id)) continue;
        if (!isTaskApplicableToday(task.recurrence)) continue;

        new Notification(`TaskZen: ${task.title}`, {
          body: task.description || `Scheduled for ${task.scheduledTime}`,
          icon: "/favicon.ico",
          tag: task.id,
        });

        markNotified(task.id);
      }
    }

    // Check immediately, then every 30s
    checkTasks();
    intervalRef.current = setInterval(checkTasks, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, tasks]);

  return { enabled, permission, toggleEnabled, requestPermission };
}
