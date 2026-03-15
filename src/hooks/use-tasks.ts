"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TaskInput } from "@/lib/validations/task";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  color: string;
  recurrence: "DAILY" | "WEEKLY" | "MONTHLY";
  scheduledTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
  nextCursor: string | null;
  hasMore: boolean;
}

async function fetchTasks(): Promise<Task[]> {
  const allTasks: Task[] = [];
  let cursor: string | undefined;

  // Fetch all pages (cursor-based pagination)
  do {
    const url = new URL("/api/tasks", window.location.origin);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch tasks");

    const data: TasksResponse = await res.json();
    allTasks.push(...data.tasks);
    cursor = data.nextCursor ?? undefined;
  } while (cursor);

  return allTasks;
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskInput }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useToggleTaskActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, isActive } : t))
      );
      return { previous };
    },
    onSuccess: (_data, { isActive }) => {
      toast.success(isActive ? "Task activated!" : "Task paused!");
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Task deleted!");
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
