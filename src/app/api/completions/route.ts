import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateString, dayRange } from "@/lib/date-utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    // Use UTC dates to avoid timezone shifts with @db.Date columns
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        task: true,
      },
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

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Parse "yyyy-MM-dd" explicitly to UTC to avoid timezone drift
    const dateObj = parseDateString(date);

    // Use a date range for the lookup to handle timezone shifts between
    // Prisma and PostgreSQL @db.Date columns
    const existing = await prisma.taskCompletion.findFirst({
      where: {
        taskId,
        userId: session.user.id,
        date: dayRange(dateObj),
      },
    });

    if (existing) {
      await prisma.taskCompletion.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "deleted", id: existing.id });
    }

    try {
      const completion = await prisma.taskCompletion.create({
        data: {
          taskId,
          userId: session.user.id,
          date: dateObj,
        },
      });

      return NextResponse.json({ action: "created", completion }, { status: 201 });
    } catch (createError) {
      // Handle race condition: if a concurrent request created the same
      // completion between our findFirst and create, delete it instead
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        const duplicate = await prisma.taskCompletion.findFirst({
          where: { taskId, userId: session.user.id, date: dayRange(dateObj) },
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
