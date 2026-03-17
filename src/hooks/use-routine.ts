"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ScheduleBlockInput } from "@/lib/validations/routine";

export interface RoutineData {
  wakeUpTime: string | null;
  sleepTime: string | null;
}

export interface ScheduleBlock {
  id: string;
  userId: string;
  label: string;
  startTime: string;
  endTime: string;
  days: number[];
  type: string;
  createdAt: string;
}

export function useRoutine() {
  return useQuery({
    queryKey: ["routine"],
    queryFn: async (): Promise<RoutineData> => {
      const res = await fetch("/api/user/routine");
      if (!res.ok) throw new Error("Failed to fetch routine");
      return res.json();
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoutineData) => {
      const res = await fetch("/api/user/routine", {
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
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      toast.success("Routine updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useScheduleBlocks() {
  return useQuery({
    queryKey: ["schedule-blocks"],
    queryFn: async (): Promise<ScheduleBlock[]> => {
      const res = await fetch("/api/user/schedule");
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
  });
}

export function useCreateScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScheduleBlockInput) => {
      const res = await fetch("/api/user/schedule", {
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
      queryClient.invalidateQueries({ queryKey: ["schedule-blocks"] });
      toast.success("Schedule block added!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/schedule?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-blocks"] });
      toast.success("Schedule block removed!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
