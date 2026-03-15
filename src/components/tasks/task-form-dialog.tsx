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
import { CATEGORIES, RECURRENCE_OPTIONS } from "@/lib/constants";
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
      });
    } else {
      reset({
        title: "",
        description: "",
        category: "general",
        color: "#6366f1",
        recurrence: "DAILY",
        scheduledTime: "",
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

  function handleCategoryChange(value: string | null) {
    if (!value) return;
    setValue("category", value);
    const cat = CATEGORIES.find((c) => c.value === value);
    if (cat) setValue("color", cat.color);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Morning workout" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" placeholder="Add details..." {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
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
              <Label>Recurrence</Label>
              <Select
                value={watch("recurrence")}
                onValueChange={(v) => { if (v) setValue("recurrence", v as TaskInput["recurrence"]); }}
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

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time (optional)</Label>
            <Input id="scheduledTime" type="time" {...register("scheduledTime")} />
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
