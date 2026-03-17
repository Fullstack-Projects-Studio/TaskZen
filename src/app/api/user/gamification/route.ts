import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true, bestStreak: true },
    });

    const totalCompletions = await prisma.taskCompletion.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      bestStreak: user?.bestStreak ?? 0,
      totalCompletions,
    });
  } catch (error) {
    console.error("Gamification API error:", error);
    return NextResponse.json({ error: "Failed to fetch gamification data" }, { status: 500 });
  }
}
