import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, duration, date } = await request.json();

    if (!duration || typeof duration !== "number" || duration < 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const dateObj = new Date(date + "T00:00:00Z");

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        taskId: taskId || null,
        duration,
        date: dateObj,
      },
    });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    console.error("Focus session error:", error);
    return NextResponse.json({ error: "Failed to save focus session" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        date: { gte: since },
      },
      include: { task: { select: { title: true, color: true } } },
      orderBy: { completedAt: "desc" },
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    const totalSessions = sessions.length;

    return NextResponse.json({ sessions, totalMinutes, totalSessions });
  } catch (error) {
    console.error("Focus sessions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch focus sessions" }, { status: 500 });
  }
}
