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

export function TaskProgressDialog() {
  const [open, setOpen] = useState(false);
  const { data: tasks, isLoading } = useTaskProgress();

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const activeTasks = tasks?.filter((t) => t.isActive) ?? [];

  if (isLoading || activeTasks.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            onClick={() => setOpen(false)}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
