"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskSchema, type TaskInput } from "@/lib/validations/task";
import { CATEGORIES, RECURRENCE_OPTIONS, DAYS_OF_WEEK } from "@/lib/constants";
import { useCreateTask, useUpdateTask, type Task } from "@/hooks/use-tasks";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = !!task;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      color: "#6366f1",
      recurrence: "DAILY",
      scheduledTime: "",
      recurrenceDays: undefined,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        category: task.category,
        color: task.color,
        recurrence: task.recurrence,
        scheduledTime: task.scheduledTime || "",
        recurrenceDays: task.recurrenceDays ?? undefined,
        startDate: task.startDate ? task.startDate.slice(0, 10) : "",
        endDate: task.endDate ? task.endDate.slice(0, 10) : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        category: "general",
        color: "#6366f1",
        recurrence: "DAILY",
        scheduledTime: "",
        recurrenceDays: undefined,
        startDate: "",
        endDate: "",
      });
    }
  }, [task, reset]);

  async function onSubmit(data: TaskInput) {
    if (isEditing && task) {
      await updateTask.mutateAsync({ id: task.id, data });
    } else {
      await createTask.mutateAsync(data);
    }
    onOpenChange(false);
  }

  const selectedCategory = watch("category");
  const selectedRecurrence = watch("recurrence");
  const selectedRecurrenceDays = watch("recurrenceDays");

  function handleCategoryChange(value: string | null) {
    if (!value) return;
    setValue("category", value);
    const cat = CATEGORIES.find((c) => c.value === value);
    if (cat) setValue("color", cat.color);
  }

  function handleRecurrenceChange(value: string | null) {
    if (!value) return;
    setValue("recurrence", value as TaskInput["recurrence"]);
    // Reset recurrenceDays when switching types
    if (value === "CUSTOM_WEEKLY") {
      setValue("recurrenceDays", []);
    } else if (value === "CUSTOM_MONTHLY") {
      setValue("recurrenceDays", []);
    } else if (value === "FLEXIBLE_WEEKLY") {
      setValue("recurrenceDays", { targetCount: 3 });
    } else {
      setValue("recurrenceDays", undefined);
    }
  }

  function toggleDay(day: number) {
    const current = Array.isArray(selectedRecurrenceDays) ? selectedRecurrenceDays : [];
    const updated = current.includes(day)
      ? current.filter((d: number) => d !== day)
      : [...current, day].sort((a: number, b: number) => a - b);
    setValue("recurrenceDays", updated, { shouldValidate: true });
  }

  function toggleMonthDate(date: number) {
    const current = Array.isArray(selectedRecurrenceDays) ? selectedRecurrenceDays : [];
    const updated = current.includes(date)
      ? current.filter((d: number) => d !== date)
      : [...current, date].sort((a: number, b: number) => a - b);
    setValue("recurrenceDays", updated, { shouldValidate: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" placeholder="e.g., Morning workout" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" placeholder="Add details..." {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recurrence <span className="text-destructive">*</span></Label>
              <Select
                value={selectedRecurrence}
                onValueChange={handleRecurrenceChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedRecurrence === "CUSTOM_WEEKLY" && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = Array.isArray(selectedRecurrenceDays) && selectedRecurrenceDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {errors.recurrenceDays && (
                <p className="text-sm text-destructive">{String(errors.recurrenceDays.message || "Invalid")}</p>
              )}
            </div>
          )}

          {selectedRecurrence === "CUSTOM_MONTHLY" && (
            <div className="space-y-2">
              <Label>Select Dates</Label>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                  const selected = Array.isArray(selectedRecurrenceDays) && selectedRecurrenceDays.includes(date);
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggleMonthDate(date)}
                      className={`px-1 py-1 rounded text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
              {errors.recurrenceDays && (
                <p className="text-sm text-destructive">{String(errors.recurrenceDays.message || "Invalid")}</p>
              )}
            </div>
          )}

          {selectedRecurrence === "FLEXIBLE_WEEKLY" && (
            <div className="space-y-2">
              <Label>Times per week</Label>
              <Select
                value={String(
                  selectedRecurrenceDays &&
                    typeof selectedRecurrenceDays === "object" &&
                    !Array.isArray(selectedRecurrenceDays)
                    ? selectedRecurrenceDays.targetCount
                    : 3
                )}
                onValueChange={(v) => {
                  if (v) setValue("recurrenceDays", { targetCount: parseInt(v) }, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}x per week
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recurrenceDays && (
                <p className="text-sm text-destructive">{String(errors.recurrenceDays.message || "Invalid")}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time (optional)</Label>
            <Input id="scheduledTime" type="time" {...register("scheduledTime")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-destructive">{String(errors.startDate.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date <span className="text-destructive">*</span></Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-sm text-destructive">{String(errors.endDate.message)}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
