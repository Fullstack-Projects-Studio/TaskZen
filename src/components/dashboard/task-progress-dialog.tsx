"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskProgress, type TaskProgressData } from "@/hooks/use-task-progress";
import {
  calculateTotalExpectedCompletions,
  calculateDaysRemaining,
  getUrgencyColor,
} from "@/lib/progress";
import { getCategoryLabel } from "@/lib/constants";
import { CalendarClock, Target } from "lucide-react";

function TaskProgressCard({ task }: { task: TaskProgressData }) {
  const expected = calculateTotalExpectedCompletions(task);
  const daysRemaining = calculateDaysRemaining(task.endDate);
  const urgency = getUrgencyColor(daysRemaining);

  const progress =
    expected !== null && expected > 0
      ? Math.min(Math.round((task.completionCount / expected) * 100), 100)
      : null;

  const daysLabel =
    daysRemaining === null
      ? "Ongoing"
      : daysRemaining < 0
        ? `${Math.abs(daysRemaining)}d overdue`
        : daysRemaining === 0
          ? "Due today"
          : `${daysRemaining}d left`;

  return (
    <div
      className={`rounded-lg border-2 p-3 space-y-2 transition-colors ${urgency.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {getCategoryLabel(task.category)}
            </Badge>
            {task.endDate && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <CalendarClock className="w-3 h-3" />
                {new Date(task.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold whitespace-nowrap ${urgency.text}`}>
          {daysLabel}
        </span>
      </div>

      {progress !== null ? (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              {task.completionCount}/{expected} completions
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${urgency.progress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Target className="w-3 h-3" />
          <span>{task.completionCount} completions so far</span>
        </div>
      )}
    </div>
  );
}

const STORAGE_KEY = "task-progress-dialog";

function shouldShowDialog(): boolean {
  const now = new Date();
  const today = now.toDateString();
  const isEvening = now.getHours() >= 20;
  const slot = isEvening ? "evening" : "day";

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    // Different day — always show
    if (stored.date !== today) return true;
    // Same day — only show if this slot hasn't been shown yet
    return stored[slot] !== true;
  } catch {
    return true;
  }
}

function markDialogShown() {
  const now = new Date();
  const today = now.toDateString();
  const isEvening = now.getHours() >= 20;
  const slot = isEvening ? "evening" : "day";

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    // Reset if it's a new day
    const data = stored.date === today ? stored : { date: today };
    data[slot] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function TaskProgressDialog() {
  const [open, setOpen] = useState(false);
  const { data: tasks, isLoading } = useTaskProgress();

  useEffect(() => {
    if (!shouldShowDialog()) return;
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const activeTasks = tasks?.filter((t) => t.isActive) ?? [];

  if (isLoading || activeTasks.length === 0) return null;

  function handleClose() {
    markDialogShown();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Task Progress</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-3 pr-1 -mr-1">
          {activeTasks.map((task) => (
            <TaskProgressCard key={task.id} task={task} />
          ))}
        </div>

        <div className="pt-3 border-t">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleClose}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
