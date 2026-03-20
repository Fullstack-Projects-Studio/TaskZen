import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { completions: true },
        },
      },
    });

    const result = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      color: t.color,
      recurrence: t.recurrence,
      recurrenceDays: t.recurrenceDays,
      isActive: t.isActive,
      startDate: t.startDate ? t.startDate.toISOString() : null,
      endDate: t.endDate ? t.endDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      completionCount: t._count.completions,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch task progress" },
      { status: 500 }
    );
  }
}
