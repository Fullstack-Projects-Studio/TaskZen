"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type TimerState = "idle" | "running" | "paused" | "break";

const DEFAULT_WORK = 25 * 60; // 25 min
const DEFAULT_BREAK = 5 * 60; // 5 min

function getSettings() {
  if (typeof window === "undefined") return { work: DEFAULT_WORK, break: DEFAULT_BREAK };
  try {
    const raw = localStorage.getItem("taskzen-focus-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        work: (parsed.work ?? 25) * 60,
        break: (parsed.break ?? 5) * 60,
      };
    }
  } catch {}
  return { work: DEFAULT_WORK, break: DEFAULT_BREAK };
}

export function useFocusTimer() {
  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK);
  const [totalDuration, setTotalDuration] = useState(DEFAULT_WORK);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    const settings = getSettings();
    setTotalDuration(settings.work);
    setTimeLeft(settings.work);
    setState("running");
  }, []);

  const pause = useCallback(() => {
    setState("paused");
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState("running");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    const settings = getSettings();
    setState("idle");
    setTimeLeft(settings.work);
    setTotalDuration(settings.work);
  }, [clearTimer]);

  const startBreak = useCallback(() => {
    const settings = getSettings();
    setTotalDuration(settings.break);
    setTimeLeft(settings.break);
    setState("break");
  }, []);

  useEffect(() => {
    if (state !== "running" && state !== "break") {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (state === "running") {
            // Play sound
            try { new Audio("/notification.mp3").play().catch(() => {}); } catch {}
            return 0;
          }
          // Break finished
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [state, clearTimer]);

  return {
    state,
    timeLeft,
    totalDuration,
    start,
    pause,
    resume,
    reset,
    startBreak,
    setState,
  };
}
