import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  getDaysInMonth,
  getDate,
} from "date-fns";

type RecurrenceType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM_WEEKLY"
  | "CUSTOM_MONTHLY"
  | "FLEXIBLE_WEEKLY";

export function getApplicableDays(
  recurrence: RecurrenceType,
  year: number,
  month: number,
  recurrenceDays?: number[] | { targetCount: number } | null
): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const allDays = eachDayOfInterval({ start, end });

  switch (recurrence) {
    case "DAILY":
      return allDays;

    case "WEEKLY":
      return allDays.filter((d) => getDay(d) === 1);

    case "MONTHLY":
      return [start];

    case "CUSTOM_WEEKLY": {
      const days = Array.isArray(recurrenceDays) ? recurrenceDays : [];
      return allDays.filter((d) => days.includes(getDay(d)));
    }

    case "CUSTOM_MONTHLY": {
      const dates = Array.isArray(recurrenceDays) ? recurrenceDays : [];
      return allDays.filter((d) => dates.includes(getDate(d)));
    }

    case "FLEXIBLE_WEEKLY": {
      const target =
        recurrenceDays &&
        typeof recurrenceDays === "object" &&
        !Array.isArray(recurrenceDays) &&
        "targetCount" in recurrenceDays
          ? recurrenceDays.targetCount
          : 3;
      // For flexible weekly, return enough days spread across weeks
      const weeks: Date[][] = [];
      let currentWeek: Date[] = [];
      let lastWeekNum = -1;
      for (const d of allDays) {
        const weekNum = Math.floor((d.getDate() - 1) / 7);
        if (weekNum !== lastWeekNum && currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
        currentWeek.push(d);
        lastWeekNum = weekNum;
      }
      if (currentWeek.length > 0) weeks.push(currentWeek);

      const result: Date[] = [];
      for (const week of weeks) {
        // Take first N days of each week as applicable
        result.push(...week.slice(0, target));
      }
      return result;
    }

    default:
      return allDays;
  }
}

export function getDaysInMonthArray(year: number, month: number): number[] {
  const count = getDaysInMonth(new Date(year, month));
  return Array.from({ length: count }, (_, i) => i + 1);
}
