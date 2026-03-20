"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProgressTask } from "@/lib/progress";

export interface TaskProgressData extends ProgressTask {
  completionCount: number;
}

async function fetchTaskProgress(): Promise<TaskProgressData[]> {
  const res = await fetch("/api/tasks/progress");
  if (!res.ok) throw new Error("Failed to fetch task progress");
  return res.json();
}

export function useTaskProgress() {
  return useQuery({
    queryKey: ["task-progress"],
    queryFn: fetchTaskProgress,
  });
}
