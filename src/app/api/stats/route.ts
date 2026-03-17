import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDay, getDate } from "date-fns";

function isTaskApplicableOnDate(
  task: { recurrence: string; recurrenceDays?: unknown },
  dayOfWeek: number,
  dayOfMonth: number
): boolean {
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

function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    const now = new Date();
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    // Fetch tasks, user, completions, and recent activity in parallel
    const [allTasks, user, completions, recentActivity] = await Promise.all([
      prisma.task.findMany({
        where: { userId, isActive: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, bestStreak: true },
      }),
      prisma.taskCompletion.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        include: { task: true },
      }),
      prisma.taskCompletion.findMany({
        where: { userId },
        include: { task: { select: { title: true, category: true, color: true } } },
        orderBy: { completedAt: "desc" },
        distinct: ["taskId", "date"],
        take: 10,
      }),
    ]);

    const totalTasks = allTasks.length;
    const todayStr = formatDateKey(now);
    const todayCompletions = completions.filter(
      (c) => formatDateKey(new Date(c.date)) === todayStr
    );

    const daysElapsed = Math.min(now.getDate(), endDate.getUTCDate());

    // Pre-compute date info for the month once (avoid creating Date objects in nested loops)
    const monthDates: { dayOfWeek: number; dayOfMonth: number }[] = [];
    for (let d = 1; d <= daysElapsed; d++) {
      const date = new Date(Date.UTC(year, month, d));
      monthDates.push({ dayOfWeek: getDay(date), dayOfMonth: getDate(date) });
    }

    // Calculate expected completions and category breakdown in a single pass over tasks
    let expectedCompletions = 0;
    const categoryMap: Record<string, { total: number; completed: number }> = {};

    // First, tally completions per category
    for (const c of completions) {
      const cat = c.task.category;
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
      categoryMap[cat].completed++;
    }

    // Then, calculate applicable days per task (single loop over tasks x pre-computed dates)
    for (const t of allTasks) {
      if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 };
      let taskApplicableDays = 0;
      for (const { dayOfWeek, dayOfMonth } of monthDates) {
        if (isTaskApplicableOnDate(t, dayOfWeek, dayOfMonth)) {
          taskApplicableDays++;
        }
      }
      expectedCompletions += taskApplicableDays;
      categoryMap[t.category].total += taskApplicableDays;
    }

    const completionRate = expectedCompletions > 0
      ? Math.round((completions.length / expectedCompletions) * 100)
      : 0;

    // Streak calculation — cap lookback at 90 days instead of 365
    let streak = 0;
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    if (totalTasks > 0) {
      const maxLookback = 90;
      const streakLookbackDate = new Date(today);
      streakLookbackDate.setUTCDate(streakLookbackDate.getUTCDate() - maxLookback);

      const streakCompletions = await prisma.taskCompletion.findMany({
        where: {
          userId,
          date: { gte: streakLookbackDate, lte: today },
        },
        select: { date: true },
      });

      const completionsByDate = new Map<string, number>();
      for (const c of streakCompletions) {
        const key = formatDateKey(new Date(c.date));
        completionsByDate.set(key, (completionsByDate.get(key) || 0) + 1);
      }

      const checkDate = new Date(today);
      for (let i = 0; i < maxLookback; i++) {
        const dow = getDay(checkDate);
        const dom = getDate(checkDate);
        let applicableCount = 0;
        for (const task of allTasks) {
          if (isTaskApplicableOnDate(task, dow, dom)) applicableCount++;
        }

        if (applicableCount === 0) {
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          continue;
        }

        const dateKey = formatDateKey(checkDate);
        const dayCount = completionsByDate.get(dateKey) || 0;

        if (dayCount >= applicableCount) {
          streak++;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
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
