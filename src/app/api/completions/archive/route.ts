import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getApplicableDays } from "@/lib/recurrence";
import { format, getDay, getDate, getDaysInMonth } from "date-fns";

function isTaskApplicableOnDate(
  task: { recurrence: string; recurrenceDays?: unknown },
  date: Date
): boolean {
  const dayOfWeek = getDay(date);
  const dayOfMonth = getDate(date);

  switch (task.recurrence) {
    case "DAILY":
      return true;
    case "WEEKLY":
      return dayOfWeek === 1;
    case "MONTHLY":
      return dayOfMonth === 1;
    case "CUSTOM_WEEKLY": {
      const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      return days.includes(dayOfWeek);
    }
    case "CUSTOM_MONTHLY": {
      const dates = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
      return dates.includes(dayOfMonth);
    }
    case "FLEXIBLE_WEEKLY":
      return true;
    default:
      return true;
  }
}

function getApplicableTaskCount(
  tasks: { recurrence: string; recurrenceDays?: unknown }[],
  date: Date
): number {
  return tasks.filter((task) => isTaskApplicableOnDate(task, date)).length;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await request.json();

    if (month < 0 || month > 11 || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    const userId = session.user.id;

    const startDate = new Date(Date.UTC(year, month, 1));
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const endDate = new Date(Date.UTC(year, month, daysInMonth));

    const tasks = await prisma.task.findMany({
      where: { userId, isActive: true },
    });

    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { task: true },
    });

    let totalTasks = 0;
    for (const task of tasks) {
      const applicableDays = getApplicableDays(
        task.recurrence as "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM_WEEKLY" | "CUSTOM_MONTHLY" | "FLEXIBLE_WEEKLY",
        year,
        month,
        task.recurrenceDays as number[] | { targetCount: number } | null
      );
      totalTasks += applicableDays.length;
    }

    const completedTasks = completions.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const categoryBreakdown: Record<string, number> = {};
    completions.forEach((c) => {
      categoryBreakdown[c.task.category] = (categoryBreakdown[c.task.category] || 0) + 1;
    });

    let streakDays = 0;
    if (tasks.length > 0) {
      const completionsByDate = new Map<string, number>();
      for (const c of completions) {
        const key = format(new Date(c.date), "yyyy-MM-dd");
        completionsByDate.set(key, (completionsByDate.get(key) || 0) + 1);
      }

      let currentStreak = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(Date.UTC(year, month, d));
        const applicableCount = getApplicableTaskCount(tasks, date);

        if (applicableCount === 0) continue;

        const dateKey = format(date, "yyyy-MM-dd");
        const dayCount = completionsByDate.get(dateKey) || 0;

        if (dayCount >= applicableCount) {
          currentStreak++;
          streakDays = Math.max(streakDays, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    }

    const archive = await prisma.monthlyArchive.upsert({
      where: { userId_month_year: { userId, month, year } },
      update: { totalTasks, completedTasks, completionRate, streakDays, categoryBreakdown },
      create: { userId, month, year, totalTasks, completedTasks, completionRate, streakDays, categoryBreakdown },
    });

    return NextResponse.json(archive);
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json({ error: "Failed to archive" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const archives = await prisma.monthlyArchive.findMany({
      where: { userId: session.user.id, year },
      orderBy: { month: "asc" },
    });

    return NextResponse.json(archives);
  } catch (error) {
    console.error("Fetch archives error:", error);
    return NextResponse.json({ error: "Failed to fetch archives" }, { status: 500 });
  }
}
