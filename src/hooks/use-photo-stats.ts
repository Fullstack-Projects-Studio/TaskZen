"use client";

import { useQuery } from "@tanstack/react-query";

export interface PhotoStats {
  overallConsistency: number;
  totalApplicableDays: number;
  totalPhotoDays: number;
  perTask: Array<{
    taskId: string;
    taskTitle: string;
    category: string;
    color: string;
    applicableDays: number;
    photoDays: number;
    consistency: number;
  }>;
}

export function usePhotoStats(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["photo-stats", m, y],
    queryFn: async (): Promise<PhotoStats> => {
      const res = await fetch(`/api/photos/stats?month=${m}&year=${y}`);
      if (!res.ok) throw new Error("Failed to fetch photo stats");
      return res.json();
    },
  });
}
