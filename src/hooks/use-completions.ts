"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Completion {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  completedAt: string;
  task: {
    id: string;
    title: string;
    category: string;
    color: string;
  };
}

export function useCompletions(month: number, year: number) {
  return useQuery({
    queryKey: ["completions", month, year],
    queryFn: async (): Promise<Completion[]> => {
      const res = await fetch(`/api/completions?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch completions");
      return res.json();
    },
  });
}

function normalizeDate(d: string) {
  // Extract UTC date components to avoid timezone-shifted ISO strings
  const dt = new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: string; date: string }) => {
      const res = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, date }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to toggle completion");
      }
      return res.json();
    },
    onMutate: async ({ taskId, date }) => {
      // Parse "yyyy-MM-dd" directly to avoid local timezone shifting the month
      const [year, month] = date.split("-").map(Number);
      const queryKey = ["completions", month - 1, year];

      // Cancel in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<Completion[]>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<Completion[]>(queryKey, (old = []) => {
        const exists = old.some(
          (c) => c.taskId === taskId && normalizeDate(c.date) === date
        );
        if (exists) {
          // Uncheck: remove the completion
          return old.filter(
            (c) => !(c.taskId === taskId && normalizeDate(c.date) === date)
          );
        } else {
          // Check: add a temporary completion
          return [
            ...old,
            {
              id: `optimistic-${Date.now()}`,
              taskId,
              userId: "",
              date,
              completedAt: new Date().toISOString(),
              task: { id: taskId, title: "", category: "", color: "" },
            },
          ];
        }
      });

      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      // Rollback to previous state on error
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.error(_err.message || "Failed to toggle completion");
    },
    onSettled: () => {
      // Refetch completions in background to sync with server
      queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });
}
