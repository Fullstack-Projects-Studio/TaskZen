import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const wakeSleepSchema = z.object({
  wakeUpTime: z
    .string()
    .regex(timeRegex, "Must be HH:MM format")
    .nullable(),
  sleepTime: z
    .string()
    .regex(timeRegex, "Must be HH:MM format")
    .nullable(),
});

export const scheduleBlockSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Select at least one day"),
  type: z.enum(["WORK", "SCHOOL", "COLLEGE", "CUSTOM"]),
});

export type WakeSleepInput = z.infer<typeof wakeSleepSchema>;
export type ScheduleBlockInput = z.infer<typeof scheduleBlockSchema>;
