export interface ProgressTask {
  id: string;
  title: string;
  category: string;
  color: string;
  recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM_WEEKLY" | "CUSTOM_MONTHLY" | "FLEXIBLE_WEEKLY";
  recurrenceDays: number[] | { targetCount: number } | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

export function calculateTotalExpectedCompletions(task: ProgressTask): number | null {
  if (!task.startDate || !task.endDate) return null;

  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  if (end < start) return 0;

  const totalDays = daysBetween(start, end) + 1;

  switch (task.recurrence) {
    case "DAILY":
      return totalDays;

    case "WEEKLY": {
      // Every Monday
      let count = 0;
      const d = new Date(start);
      while (d <= end) {
        if (d.getUTCDay() === 1) count++;
        d.setUTCDate(d.getUTCDate() + 1);
      }
      return Math.max(count, 1);
    }

    case "MONTHLY": {
      // Every 1st of month
      let count = 0;
      const d = new Date(start);
      while (d <= end) {
        if (d.getUTCDate() === 1) count++;
        d.setUTCDate(d.getUTCDate() + 1);
      }
      return Math.max(count, 1);
    }

    case "CUSTOM_WEEKLY": {
      // Specified weekdays (0=Sun..6=Sat)
      const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      if (days.length === 0) return 0;
      let count = 0;
      const d = new Date(start);
      while (d <= end) {
        if (days.includes(d.getUTCDay())) count++;
        d.setUTCDate(d.getUTCDate() + 1);
      }
      return Math.max(count, 1);
    }

    case "CUSTOM_MONTHLY": {
      // Specified month-dates (1..31)
      const dates = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      if (dates.length === 0) return 0;
      let count = 0;
      const d = new Date(start);
      while (d <= end) {
        if (dates.includes(d.getUTCDate())) count++;
        d.setUTCDate(d.getUTCDate() + 1);
      }
      return Math.max(count, 1);
    }

    case "FLEXIBLE_WEEKLY": {
      // weeks × targetCount
      const rd = task.recurrenceDays;
      const target =
        rd && typeof rd === "object" && !Array.isArray(rd) ? rd.targetCount : 3;
      const weeks = Math.max(Math.ceil(totalDays / 7), 1);
      return weeks * target;
    }

    default:
      return totalDays;
  }
}

export function calculateDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

export function getUrgencyColor(daysRemaining: number | null): {
  border: string;
  progress: string;
  badge: string;
  text: string;
} {
  if (daysRemaining === null) {
    return {
      border: "border-border",
      progress: "bg-muted-foreground",
      badge: "bg-muted text-muted-foreground",
      text: "text-muted-foreground",
    };
  }
  if (daysRemaining < 0) {
    return {
      border: "border-red-500/50",
      progress: "bg-red-500",
      badge: "bg-red-500/10 text-red-500",
      text: "text-red-500",
    };
  }
  if (daysRemaining <= 3) {
    return {
      border: "border-yellow-500/50",
      progress: "bg-yellow-500",
      badge: "bg-yellow-500/10 text-yellow-500",
      text: "text-yellow-500",
    };
  }
  return {
    border: "border-green-500/50",
    progress: "bg-green-500",
    badge: "bg-green-500/10 text-green-500",
    text: "text-green-500",
  };
}
