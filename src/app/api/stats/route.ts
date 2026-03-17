import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, getDay, getDate } from "date-fns";

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
      return true; // Always applicable, user chooses when
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

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth();
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    if (isNaN(month) || isNaN(year) || month < 0 || month > 11 || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    const userId = session.user.id;

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const [allTasks, user] = await Promise.all([
      prisma.task.findMany({
        where: { userId, isActive: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, bestStreak: true },
      }),
    ]);

    const totalTasks = allTasks.length;

    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { task: true },
    });

    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const todayCompletions = completions.filter(
      (c) => format(new Date(c.date), "yyyy-MM-dd") === todayStr
    );

    const daysElapsed = Math.min(now.getDate(), endDate.getUTCDate());

    let expectedCompletions = 0;
    for (let d = 1; d <= daysElapsed; d++) {
      const date = new Date(Date.UTC(year, month, d));
      expectedCompletions += getApplicableTaskCount(allTasks, date);
    }

    const completionRate = expectedCompletions > 0
      ? Math.round((completions.length / expectedCompletions) * 100)
      : 0;

    const categoryMap: Record<string, { total: number; completed: number }> = {};
    completions.forEach((c) => {
      const cat = c.task.category;
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
      categoryMap[cat].completed++;
    });

    allTasks.forEach((t) => {
      if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 };
      let taskApplicableDays = 0;
      for (let d = 1; d <= daysElapsed; d++) {
        const date = new Date(Date.UTC(year, month, d));
        if (isTaskApplicableOnDate(t, date)) {
          taskApplicableDays++;
        }
      }
      categoryMap[t.category].total += taskApplicableDays;
    });

    // Streak calculation
    let streak = 0;
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    if (totalTasks > 0) {
      const streakLookback = subDays(today, 365);

      const streakCompletions = await prisma.taskCompletion.findMany({
        where: {
          userId,
          date: { gte: streakLookback, lte: today },
        },
        select: { date: true },
      });

      const completionsByDate = new Map<string, number>();
      for (const c of streakCompletions) {
        const key = format(new Date(c.date), "yyyy-MM-dd");
        completionsByDate.set(key, (completionsByDate.get(key) || 0) + 1);
      }

      let checkDate = today;
      for (let i = 0; i < 365; i++) {
        const applicableCount = getApplicableTaskCount(allTasks, checkDate);

        if (applicableCount === 0) {
          checkDate = subDays(checkDate, 1);
          continue;
        }

        const dateKey = format(checkDate, "yyyy-MM-dd");
        const dayCount = completionsByDate.get(dateKey) || 0;

        if (dayCount >= applicableCount) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }

      // Update bestStreak if current streak is higher
      if (user && streak > user.bestStreak) {
        await prisma.user.update({
          where: { id: userId },
          data: { bestStreak: streak },
        });
      }
    }

    const recentActivity = await prisma.taskCompletion.findMany({
      where: { userId },
      include: { task: { select: { title: true, category: true, color: true } } },
      orderBy: { completedAt: "desc" },
      distinct: ["taskId", "date"],
      take: 10,
    });

    return NextResponse.json({
      totalTasks,
      completedToday: todayCompletions.length,
      completionRate,
      streak,
      totalCompletions: completions.length,
      categoryBreakdown: categoryMap,
      recentActivity,
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      bestStreak: user?.bestStreak ?? 0,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
