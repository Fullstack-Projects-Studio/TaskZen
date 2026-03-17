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

function getReminderKey(type: string): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `taskzen-reminder-${type}-${yyyy}-${mm}-${dd}`;
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

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
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

      // Task scheduled time notifications
      for (const task of tasks) {
        if (!task.isActive) continue;
        if (!task.scheduledTime) continue;
        if (task.scheduledTime !== currentTime) continue;
        if (notifiedIds.has(task.id)) continue;
        if (!isTaskApplicableToday(task.recurrence, task.recurrenceDays)) continue;

        new Notification(`TaskZen: ${task.title}`, {
          body: task.description || `Scheduled for ${task.scheduledTime}`,
          icon: "/favicon.ico",
          tag: task.id,
        });

        markNotified(task.id);
      }

      // Smart reminders (morning/evening) - fetch from localStorage preferences
      checkSmartReminders(currentTime, tasks);
    }

    function checkSmartReminders(
      currentTime: string,
      allTasks: typeof tasks
    ) {
      if (!allTasks) return;

      try {
        const morningReminder = localStorage.getItem("taskzen-morning-reminder");
        const eveningReminder = localStorage.getItem("taskzen-evening-reminder");

        // Morning reminder
        if (morningReminder && currentTime === morningReminder) {
          const morningKey = getReminderKey("morning");
          if (!localStorage.getItem(morningKey)) {
            const todayTasks = allTasks.filter(
              (t) => t.isActive && isTaskApplicableToday(t.recurrence, t.recurrenceDays)
            );

            new Notification("Good morning!", {
              body: `You have ${todayTasks.length} tasks today. Let's make it count!`,
              icon: "/favicon.ico",
              tag: "morning-reminder",
            });
            localStorage.setItem(morningKey, "true");
          }
        }

        // Evening reminder
        if (eveningReminder && currentTime === eveningReminder) {
          const eveningKey = getReminderKey("evening");
          if (!localStorage.getItem(eveningKey)) {
            const todayTasks = allTasks.filter(
              (t) => t.isActive && isTaskApplicableToday(t.recurrence, t.recurrenceDays)
            );
            // We don't have completions here, so show total
            new Notification("Evening Check-in", {
              body: `Don't forget your remaining tasks! ${todayTasks.length} tasks today.`,
              icon: "/favicon.ico",
              tag: "evening-reminder",
            });
            localStorage.setItem(eveningKey, "true");
          }
        }

        // Wake-up and bedtime notifications
        const wakeUpTime = localStorage.getItem("taskzen-wakeup-time");
        const sleepTime = localStorage.getItem("taskzen-sleep-time");

        if (wakeUpTime && currentTime === wakeUpTime) {
          const wakeKey = getReminderKey("wakeup");
          if (!localStorage.getItem(wakeKey)) {
            new Notification("Good morning!", {
              body: "Time to start your day!",
              icon: "/favicon.ico",
              tag: "wakeup-reminder",
            });
            localStorage.setItem(wakeKey, "true");
          }
        }

        if (sleepTime && currentTime === sleepTime) {
          const sleepKey = getReminderKey("sleep");
          if (!localStorage.getItem(sleepKey)) {
            new Notification("Time for bed!", {
              body: wakeUpTime
                ? `You have a ${wakeUpTime} wake-up tomorrow.`
                : "Get some rest for tomorrow!",
              icon: "/favicon.ico",
              tag: "sleep-reminder",
            });
            localStorage.setItem(sleepKey, "true");
          }
        }
      } catch {}
    }

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
