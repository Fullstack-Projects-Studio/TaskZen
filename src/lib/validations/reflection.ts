import { z } from "zod";

export const reflectionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be yyyy-MM-dd format"),
  content: z.string().trim().min(1, "Reflection cannot be empty").max(2000),
  mood: z.number().int().min(1).max(5),
});

export type ReflectionInput = z.infer<typeof reflectionSchema>;
