import { getDay, getDate } from "date-fns";

/**
 * Returns true if a task with the given recurrence should fire today.
 * Mirrors the logic in recurrence.ts:
 *   DAILY   → every day
 *   WEEKLY  → Mondays (getDay === 1)
 *   MONTHLY → 1st of the month
 */
export function isTaskApplicableToday(
  recurrence: "DAILY" | "WEEKLY" | "MONTHLY"
): boolean {
  const today = new Date();

  switch (recurrence) {
    case "DAILY":
      return true;
    case "WEEKLY":
      return getDay(today) === 1; // Monday
    case "MONTHLY":
      return getDate(today) === 1; // 1st of month
    default:
      return true;
  }
}
