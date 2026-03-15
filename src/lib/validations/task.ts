import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(500).optional(),
  category: z.string().min(1, "Category is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code (e.g. #6366f1)"),
  recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  scheduledTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format")
    .optional()
    .or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
