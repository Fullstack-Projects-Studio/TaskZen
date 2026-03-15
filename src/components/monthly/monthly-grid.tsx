"use client";

import { useMemo } from "react";
import { format, isFuture, isToday } from "date-fns";
import { motion } from "framer-motion";
import { AnimatedCheckbox } from "@/components/tasks/animated-checkbox";
import { PhotoCell } from "@/components/tasks/photo-cell";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDaysInMonthArray } from "@/lib/recurrence";
import { getApplicableDays } from "@/lib/recurrence";
import type { Task } from "@/hooks/use-tasks";
import type { Completion } from "@/hooks/use-completions";
import type { TaskPhoto } from "@/hooks/use-photos";

interface MonthlyGridProps {
  tasks: Task[];
  completions: Completion[];
  photos: TaskPhoto[];
  month: number;
  year: number;
  onToggle: (taskId: string, date: string) => void;
  onPhotoClick: (taskId: string, taskTitle: string, taskColor: string, date: string, existingPhoto?: TaskPhoto) => void;
  isLoading: boolean;
  isReadOnly: boolean;
}

export function MonthlyGrid({
  tasks,
  completions,
  photos,
  month,
  year,
  onToggle,
  onPhotoClick,
  isLoading,
  isReadOnly,
}: MonthlyGridProps) {
  const days = getDaysInMonthArray(year, month);

  const completionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    completions.forEach((c) => {
      const dateStr = format(new Date(c.date), "yyyy-MM-dd");
      if (!map.has(c.taskId)) map.set(c.taskId, new Set());
      map.get(c.taskId)!.add(dateStr);
    });
    return map;
  }, [completions]);

  const photoMap = useMemo(() => {
    const map = new Map<string, TaskPhoto>();
    photos.forEach((p) => {
      const dateStr = new Date(p.date).toISOString().split("T")[0];
      map.set(`${p.taskId}-${dateStr}`, p);
    });
    return map;
  }, [photos]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm">Create tasks first to track them here</p>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => t.isActive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto border rounded-lg"
    >
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left text-sm font-medium min-w-[140px] border-b border-r">
              Task
            </th>
            {days.map((day) => {
              const date = new Date(year, month, day);
              const today = isToday(date);
              return (
                <th
                  key={day}
                  className={`px-1 py-2 text-center text-xs font-medium border-b min-w-[36px] ${
                    today ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  {day}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {activeTasks.map((task, idx) => {
            const applicableDays = getApplicableDays(task.recurrence, year, month);
            const applicableDayNumbers = new Set(
              applicableDays.map((d) => d.getDate())
            );

            return (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="sticky left-0 z-10 bg-card px-3 py-2 border-r">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.color }}
                    />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {task.title}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const date = new Date(year, month, day);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const isApplicable = applicableDayNumbers.has(day);
                  const isCompleted =
                    completionMap.get(task.id)?.has(dateStr) ?? false;
                  const future = isFuture(date) && !isToday(date);
                  const today = isToday(date);

                  if (!isApplicable) {
                    return (
                      <td key={day} className="px-1 py-2 text-center">
                        <div className="w-6 h-6 mx-auto text-muted-foreground/20">
                          &mdash;
                        </div>
                      </td>
                    );
                  }

                  const photoKey = `${task.id}-${dateStr}`;
                  const existingPhoto = photoMap.get(photoKey);

                  return (
                    <td
                      key={day}
                      className={`px-1 py-1.5 text-center ${
                        today ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="relative inline-flex items-center justify-center">
                        <AnimatedCheckbox
                          checked={isCompleted}
                          onChange={() => onToggle(task.id, dateStr)}
                          color={task.color}
                          disabled={isReadOnly || future}
                          size={22}
                        />
                        {isCompleted && !future && (
                          <div className="absolute -bottom-1 -right-1">
                            <PhotoCell
                              hasPhoto={!!existingPhoto}
                              disabled={isReadOnly}
                              onClick={() =>
                                onPhotoClick(
                                  task.id,
                                  task.title,
                                  task.color,
                                  dateStr,
                                  existingPhoto
                                )
                              }
                              color={task.color}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
