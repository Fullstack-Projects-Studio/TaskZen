import { getDay, getDate } from "date-fns";

type RecurrenceType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM_WEEKLY"
  | "CUSTOM_MONTHLY"
  | "FLEXIBLE_WEEKLY";

/**
 * Returns true if a task with the given recurrence should fire today.
 */
export function isTaskApplicableToday(
  recurrence: RecurrenceType,
  recurrenceDays?: number[] | { targetCount: number } | null
): boolean {
  const today = new Date();

  switch (recurrence) {
    case "DAILY":
      return true;
    case "WEEKLY":
      return getDay(today) === 1;
    case "MONTHLY":
      return getDate(today) === 1;
    case "CUSTOM_WEEKLY": {
      const days = Array.isArray(recurrenceDays) ? recurrenceDays : [];
      return days.includes(getDay(today));
    }
    case "CUSTOM_MONTHLY": {
      const dates = Array.isArray(recurrenceDays) ? recurrenceDays : [];
      return dates.includes(getDate(today));
    }
    case "FLEXIBLE_WEEKLY":
      // Flexible tasks are always applicable - user decides when to do them
      return true;
    default:
      return true;
  }
}
