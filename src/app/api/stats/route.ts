import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, getDay, getDate } from "date-fns";

function getApplicableTaskCount(
  tasks: { recurrence: string }[],
  date: Date
): number {
  const dayOfWeek = getDay(date);
  const dayOfMonth = getDate(date);

  return tasks.filter((task) => {
    switch (task.recurrence) {
      case "DAILY":
        return true;
      case "WEEKLY":
        return dayOfWeek === 1;
      case "MONTHLY":
        return dayOfMonth === 1;
      default:
        return true;
    }
  }).length;
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

    // Validate month and year
    if (isNaN(month) || isNaN(year) || month < 0 || month > 11 || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    const userId = session.user.id;

    // Use UTC dates consistently to match completions route
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    // Get all active tasks
    const allTasks = await prisma.task.findMany({
      where: { userId, isActive: true },
    });

    const totalTasks = allTasks.length;

    // Get completions for the month
    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { task: true },
    });

    // Today's completions
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const todayCompletions = completions.filter(
      (c) => format(new Date(c.date), "yyyy-MM-dd") === todayStr
    );

    // Monthly rate: completions / expected (accounting for recurrence)
    const daysElapsed = Math.min(now.getDate(), endDate.getUTCDate());

    let expectedCompletions = 0;
    for (let d = 1; d <= daysElapsed; d++) {
      const date = new Date(Date.UTC(year, month, d));
      expectedCompletions += getApplicableTaskCount(allTasks, date);
    }

    const completionRate = expectedCompletions > 0
      ? Math.round((completions.length / expectedCompletions) * 100)
      : 0;

    // Category breakdown
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
        const dayOfWeek = getDay(date);
        const dayOfMonth = getDate(date);
        if (
          t.recurrence === "DAILY" ||
          (t.recurrence === "WEEKLY" && dayOfWeek === 1) ||
          (t.recurrence === "MONTHLY" && dayOfMonth === 1)
        ) {
          taskApplicableDays++;
        }
      }
      categoryMap[t.category].total += taskApplicableDays;
    });

    // Streak calculation - single batch query
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
    }

    // Recent activity — distinct by task+date
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
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
