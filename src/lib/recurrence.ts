import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  getDaysInMonth,
} from "date-fns";

export function getApplicableDays(
  recurrence: "DAILY" | "WEEKLY" | "MONTHLY",
  year: number,
  month: number
): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  switch (recurrence) {
    case "DAILY":
      return eachDayOfInterval({ start, end });

    case "WEEKLY": {
      // Every Monday
      return eachDayOfInterval({ start, end }).filter(
        (d) => getDay(d) === 1
      );
    }

    case "MONTHLY": {
      // First day of the month
      return [start];
    }

    default:
      return eachDayOfInterval({ start, end });
  }
}

export function getDaysInMonthArray(year: number, month: number): number[] {
  const count = getDaysInMonth(new Date(year, month));
  return Array.from({ length: count }, (_, i) => i + 1);
}
