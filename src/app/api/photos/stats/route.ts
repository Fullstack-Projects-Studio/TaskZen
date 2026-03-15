import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getApplicableDays } from "@/lib/recurrence";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const userId = session.user.id;

    const tasks = await prisma.task.findMany({
      where: { userId, isActive: true },
    });

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const photos = await prisma.taskPhoto.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const photoMap = new Map<string, Set<string>>();
    photos.forEach((p) => {
      const dateStr = new Date(p.date).toISOString().split("T")[0];
      if (!photoMap.has(p.taskId)) photoMap.set(p.taskId, new Set());
      photoMap.get(p.taskId)!.add(dateStr);
    });

    const now = new Date();
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

    let totalApplicable = 0;
    let totalPhotos = 0;

    const perTask = tasks.map((task) => {
      let applicableDays = getApplicableDays(task.recurrence, year, month);

      if (isCurrentMonth) {
        applicableDays = applicableDays.filter((d) => d <= now);
      }

      const applicableCount = applicableDays.length;
      const photoDays = photoMap.get(task.id)?.size ?? 0;
      const consistency = applicableCount > 0
        ? Math.round((photoDays / applicableCount) * 100)
        : 0;

      totalApplicable += applicableCount;
      totalPhotos += photoDays;

      return {
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        color: task.color,
        applicableDays: applicableCount,
        photoDays,
        consistency,
      };
    });

    const overallConsistency = totalApplicable > 0
      ? Math.round((totalPhotos / totalApplicable) * 100)
      : 0;

    return NextResponse.json({
      overallConsistency,
      totalApplicableDays: totalApplicable,
      totalPhotoDays: totalPhotos,
      perTask,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch photo stats" }, { status: 500 });
  }
}
