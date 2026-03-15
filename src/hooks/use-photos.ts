"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TaskPhoto {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
  task: {
    id: string;
    title: string;
    category: string;
    color: string;
  };
}

export function usePhotos(month: number, year: number) {
  return useQuery({
    queryKey: ["photos", month, year],
    queryFn: async (): Promise<TaskPhoto[]> => {
      const res = await fetch(`/api/photos?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      return res.json();
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      date,
      image,
    }: {
      taskId: string;
      date: string;
      image: File;
    }) => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("taskId", taskId);
      formData.append("date", date);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload photo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["photo-stats"] });
      toast.success("Photo uploaded!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete photo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["photo-stats"] });
      toast.success("Photo removed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
