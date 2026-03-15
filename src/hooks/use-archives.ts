"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface MonthlyArchive {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  streakDays: number;
  categoryBreakdown: Record<string, number>;
}

export function useArchives(year: number) {
  return useQuery({
    queryKey: ["archives", year],
    queryFn: async (): Promise<MonthlyArchive[]> => {
      const res = await fetch(`/api/completions/archive?year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch archives");
      return res.json();
    },
  });
}

export function useArchiveMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const res = await fetch("/api/completions/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to archive month");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archives"] });
      toast.success("Month archived!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
