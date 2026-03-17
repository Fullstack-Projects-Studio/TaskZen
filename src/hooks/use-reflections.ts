"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReflectionInput } from "@/lib/validations/reflection";

export interface Reflection {
  id: string;
  userId: string;
  date: string;
  content: string;
  mood: number;
  createdAt: string;
  updatedAt: string;
}

export function useReflections(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["reflections", m, y],
    queryFn: async (): Promise<Reflection[]> => {
      const res = await fetch(`/api/reflections?month=${m}&year=${y}`);
      if (!res.ok) throw new Error("Failed to fetch reflections");
      return res.json();
    },
  });
}

export function useSaveReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReflectionInput) => {
      const res = await fetch("/api/reflections", {
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
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
      toast.success("Reflection saved!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reflections?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
      toast.success("Reflection deleted!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
