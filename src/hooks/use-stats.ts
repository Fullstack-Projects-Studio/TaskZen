"use client";

import { useQuery } from "@tanstack/react-query";

export interface Stats {
  totalTasks: number;
  completedToday: number;
  completionRate: number;
  streak: number;
  totalCompletions: number;
  categoryBreakdown: Record<string, { total: number; completed: number }>;
  recentActivity: Array<{
    id: string;
    taskId: string;
    date: string;
    completedAt: string;
    task: { title: string; category: string; color: string };
  }>;
  xp: number;
  level: number;
  bestStreak: number;
}

export function useStats(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["stats", m, y],
    queryFn: async (): Promise<Stats> => {
      const res = await fetch(`/api/stats?month=${m}&year=${y}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}
