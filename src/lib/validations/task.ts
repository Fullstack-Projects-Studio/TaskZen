import { z } from "zod";

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(100),
    description: z.string().trim().max(500).optional(),
    category: z.string().min(1, "Category is required"),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code (e.g. #6366f1)"),
    recurrence: z.enum([
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "CUSTOM_WEEKLY",
      "CUSTOM_MONTHLY",
      "FLEXIBLE_WEEKLY",
    ]),
    recurrenceDays: z.any().optional(),
    scheduledTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format")
      .optional()
      .or(z.literal("")),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be yyyy-MM-dd"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be yyyy-MM-dd"),
  })
  .refine(
    (data) => {
      if (data.recurrence === "CUSTOM_WEEKLY") {
        return (
          Array.isArray(data.recurrenceDays) &&
          data.recurrenceDays.length > 0 &&
          data.recurrenceDays.every(
            (d: number) => typeof d === "number" && d >= 0 && d <= 6
          )
        );
      }
      return true;
    },
    { message: "Select at least one day for Custom Weekly", path: ["recurrenceDays"] }
  )
  .refine(
    (data) => {
      if (data.recurrence === "CUSTOM_MONTHLY") {
        return (
          Array.isArray(data.recurrenceDays) &&
          data.recurrenceDays.length > 0 &&
          data.recurrenceDays.every(
            (d: number) => typeof d === "number" && d >= 1 && d <= 31
          )
        );
      }
      return true;
    },
    {
      message: "Select at least one date for Custom Monthly",
      path: ["recurrenceDays"],
    }
  )
  .refine(
    (data) => {
      if (data.recurrence === "FLEXIBLE_WEEKLY") {
        const rd = data.recurrenceDays;
        return (
          rd &&
          typeof rd === "object" &&
          !Array.isArray(rd) &&
          typeof rd.targetCount === "number" &&
          rd.targetCount >= 1 &&
          rd.targetCount <= 7
        );
      }
      return true;
    },
    {
      message: "Set a target count (1-7) for Flexible Weekly",
      path: ["recurrenceDays"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type TaskInput = z.infer<typeof taskSchema>;
