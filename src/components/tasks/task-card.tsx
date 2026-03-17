"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, Repeat, Pause, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type { Task } from "@/hooks/use-tasks";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleActive: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

function getRecurrenceLabel(task: Task): string {
  switch (task.recurrence) {
    case "CUSTOM_WEEKLY": {
      const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      return days.map((d: number) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label ?? "").join(", ");
    }
    case "CUSTOM_MONTHLY": {
      const dates = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      return dates.map((d: number) => `${d}${getOrdinal(d)}`).join(", ");
    }
    case "FLEXIBLE_WEEKLY": {
      const rd = task.recurrenceDays;
      const count = rd && typeof rd === "object" && !Array.isArray(rd) && "targetCount" in rd
        ? (rd as { targetCount: number }).targetCount
        : 3;
      return `${count}x/week`;
    }
    default:
      return task.recurrence;
  }
}

function getOrdinal(n: number): string {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export function TaskCard({ task, onEdit, onDelete, onToggleActive, onStartFocus }: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`group relative overflow-hidden ${!task.isActive ? "opacity-60" : ""}`}>
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: task.isActive ? task.color : "#9ca3af" }}
        />
        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-sm truncate ${!task.isActive ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                {!task.isActive && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                    Paused
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <CategoryBadge category={task.category} color={task.color} />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  {getRecurrenceLabel(task)}
                </span>
                {task.scheduledTime && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.scheduledTime}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onStartFocus && task.isActive && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Start Focus"
                  onClick={() => onStartFocus(task)}
                >
                  <Timer className="h-3.5 w-3.5 text-orange-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={task.isActive ? "Pause task" : "Activate task"}
                onClick={() => onToggleActive(task)}
              >
                {task.isActive ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-green-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(task)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
