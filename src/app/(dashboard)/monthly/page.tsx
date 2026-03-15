"use client";

import { useState } from "react";
import { MonthSelector } from "@/components/monthly/month-selector";
import { MonthlyGrid } from "@/components/monthly/monthly-grid";
import { PhotoGallery } from "@/components/monthly/photo-gallery";
import { PhotoUploadDialog } from "@/components/tasks/photo-upload-dialog";
import { ArchiveCard } from "@/components/monthly/archive-card";
import { useTasks } from "@/hooks/use-tasks";
import { useCompletions, useToggleCompletion } from "@/hooks/use-completions";
import { usePhotos } from "@/hooks/use-photos";
import type { TaskPhoto } from "@/hooks/use-photos";

interface PhotoDialogState {
  open: boolean;
  taskId: string;
  taskTitle: string;
  taskColor: string;
  date: string;
  existingPhoto?: TaskPhoto;
}

export default function MonthlyPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [photoDialog, setPhotoDialog] = useState<PhotoDialogState | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: completions, isLoading: completionsLoading } = useCompletions(month, year);
  const { data: photos, isLoading: photosLoading } = usePhotos(month, year);
  const toggleCompletion = useToggleCompletion();

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  const isReadOnly = !isCurrentMonth;

  function handleToggle(taskId: string, date: string) {
    toggleCompletion.mutate({ taskId, date });
  }

  function handlePhotoClick(
    taskId: string,
    taskTitle: string,
    taskColor: string,
    date: string,
    existingPhoto?: TaskPhoto
  ) {
    setPhotoDialog({ open: true, taskId, taskTitle, taskColor, date, existingPhoto });
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly View</h1>
          <p className="text-muted-foreground text-sm">
            {isReadOnly
              ? "Viewing past month (read-only)"
              : "Track your daily completions"}
          </p>
        </div>
        <MonthSelector
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />
      </div>

      <MonthlyGrid
        tasks={tasks || []}
        completions={completions || []}
        photos={photos || []}
        month={month}
        year={year}
        onToggle={handleToggle}
        onPhotoClick={handlePhotoClick}
        isLoading={tasksLoading || completionsLoading}
        isReadOnly={isReadOnly}
      />

      <ArchiveCard month={month} year={year} isCurrentMonth={isCurrentMonth} />

      <PhotoGallery
        photos={photos || []}
        isLoading={photosLoading}
        isReadOnly={isReadOnly}
      />

      {photoDialog && (
        <PhotoUploadDialog
          open={photoDialog.open}
          onOpenChange={(open) => {
            if (!open) setPhotoDialog(null);
          }}
          taskId={photoDialog.taskId}
          taskTitle={photoDialog.taskTitle}
          taskColor={photoDialog.taskColor}
          date={photoDialog.date}
          existingPhoto={photoDialog.existingPhoto}
          readOnly={isReadOnly}
        />
      )}
    </div>
  );
}
