"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Settings, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimerCircle } from "./timer-circle";
import { FocusSettingsDialog } from "./focus-settings-dialog";
import { useFocusContext } from "@/components/providers/focus-provider";
import { useFocusTimer } from "@/hooks/use-focus";
import { toast } from "sonner";

export function FocusMode() {
  const { activeTask, isOpen, closeFocus } = useFocusContext();
  const { state, timeLeft, totalDuration, start, pause, resume, reset, startBreak, setState } =
    useFocusTimer();
  const [showSettings, setShowSettings] = useState(false);

  const handleSaveSession = useCallback(async (duration: number) => {
    if (!activeTask) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTask.id,
          duration,
          date: today,
        }),
      });
      toast.success(`Focus session saved! ${Math.round(duration / 60)} min`);
    } catch {
      toast.error("Failed to save session");
    }
  }, [activeTask]);

  const handleClose = useCallback(() => {
    if (state === "running" || state === "paused") {
      // Save partial session
      const elapsed = totalDuration - timeLeft;
      if (elapsed >= 60) {
        handleSaveSession(elapsed);
      }
    }
    reset();
    closeFocus();
  }, [state, totalDuration, timeLeft, handleSaveSession, reset, closeFocus]);

  // When timer hits 0 and state is running, session complete
  const handleComplete = useCallback(() => {
    handleSaveSession(totalDuration);
    setState("idle");
  }, [handleSaveSession, totalDuration, setState]);

  if (timeLeft === 0 && state === "running") {
    handleComplete();
  }

  if (timeLeft === 0 && state === "break") {
    setState("idle");
    toast.success("Break over! Ready for another round?");
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-6 max-w-md px-4">
              {activeTask && (
                <div className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: activeTask.color }}
                  />
                  <h2 className="text-xl font-bold">{activeTask.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {state === "break" ? "Break Time" : "Focus Mode"}
                  </p>
                </div>
              )}

              <TimerCircle
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                color={state === "break" ? "#10b981" : activeTask?.color}
              />

              <div className="flex gap-3">
                {state === "idle" && (
                  <Button onClick={start} size="lg" className="gap-2">
                    <Play className="h-4 w-4" /> Start
                  </Button>
                )}
                {state === "running" && (
                  <Button onClick={pause} variant="outline" size="lg" className="gap-2">
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                )}
                {state === "paused" && (
                  <>
                    <Button onClick={resume} size="lg" className="gap-2">
                      <Play className="h-4 w-4" /> Resume
                    </Button>
                    <Button onClick={reset} variant="outline" size="lg" className="gap-2">
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                  </>
                )}
                {state === "idle" && timeLeft === 0 && (
                  <Button onClick={startBreak} variant="outline" size="lg" className="gap-2">
                    <Coffee className="h-4 w-4" /> Take Break
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FocusSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
