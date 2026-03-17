import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString, dayRange } from "@/lib/date-utils";
import {
  XP_PER_COMPLETION,
  STREAK_BONUS_THRESHOLD,
  STREAK_BONUS_MULTIPLIER,
  getLevelFromXP,
} from "@/lib/gamification";

async function getCurrentStreak(userId: string): Promise<number> {
  const { format, subDays, getDay, getDate } = await import("date-fns");

  const tasks = await prisma.task.findMany({
    where: { userId, isActive: true },
  });

  if (tasks.length === 0) return 0;

  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const lookback = subDays(today, 365);

  const completions = await prisma.taskCompletion.findMany({
    where: { userId, date: { gte: lookback, lte: today } },
    select: { date: true },
  });

  const completionsByDate = new Map<string, number>();
  for (const c of completions) {
    const key = format(new Date(c.date), "yyyy-MM-dd");
    completionsByDate.set(key, (completionsByDate.get(key) || 0) + 1);
  }

  let streak = 0;
  let checkDate = today;
  for (let i = 0; i < 365; i++) {
    const dayOfWeek = getDay(checkDate);
    const dayOfMonth = getDate(checkDate);

    const applicableCount = tasks.filter((task) => {
      switch (task.recurrence) {
        case "DAILY": return true;
        case "WEEKLY": return dayOfWeek === 1;
        case "MONTHLY": return dayOfMonth === 1;
        case "CUSTOM_WEEKLY": {
          const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
          return days.includes(dayOfWeek);
        }
        case "CUSTOM_MONTHLY": {
          const dates = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
          return dates.includes(dayOfMonth);
        }
        case "FLEXIBLE_WEEKLY": return true;
        default: return true;
      }
    }).length;

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

  return streak;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: { task: true },
    });

    return NextResponse.json(completions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch completions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, date } = await request.json();

    if (!taskId || !date) {
      return NextResponse.json({ error: "taskId and date are required" }, { status: 400 });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const dateObj = parseDateString(date);
    const userId = session.user.id;

    const existing = await prisma.taskCompletion.findFirst({
      where: {
        taskId,
        userId,
        date: dayRange(dateObj),
      },
    });

    if (existing) {
      // Unchecking - remove completion and subtract XP
      await prisma.taskCompletion.delete({ where: { id: existing.id } });

      // Subtract XP (don't go below 0)
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
      const currentXP = user?.xp ?? 0;
      const newXP = Math.max(0, currentXP - XP_PER_COMPLETION);
      const newLevel = getLevelFromXP(newXP);

      await prisma.user.update({
        where: { id: userId },
        data: { xp: newXP, level: newLevel },
      });

      return NextResponse.json({ action: "deleted", id: existing.id });
    }

    try {
      const completion = await prisma.taskCompletion.create({
        data: { taskId, userId, date: dateObj },
      });

      // Award XP
      const streak = await getCurrentStreak(userId);
      const xpGain = streak >= STREAK_BONUS_THRESHOLD
        ? XP_PER_COMPLETION * STREAK_BONUS_MULTIPLIER
        : XP_PER_COMPLETION;

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, bestStreak: true } });
      const newXP = (user?.xp ?? 0) + xpGain;
      const newLevel = getLevelFromXP(newXP);
      const bestStreak = Math.max(user?.bestStreak ?? 0, streak);

      await prisma.user.update({
        where: { id: userId },
        data: { xp: newXP, level: newLevel, bestStreak },
      });

      return NextResponse.json({ action: "created", completion, xpGain }, { status: 201 });
    } catch (createError) {
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        const duplicate = await prisma.taskCompletion.findFirst({
          where: { taskId, userId, date: dayRange(dateObj) },
        });
        if (duplicate) {
          await prisma.taskCompletion.delete({ where: { id: duplicate.id } });
        }
        return NextResponse.json({ action: "deleted" });
      }
      throw createError;
    }
  } catch (error) {
    console.error("Toggle completion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to toggle completion" },
      { status: 500 }
    );
  }
}
