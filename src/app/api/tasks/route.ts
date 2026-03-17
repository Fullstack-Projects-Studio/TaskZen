import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations/task";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "500"), 500);
    const cursor = searchParams.get("cursor") || undefined;
    const activeOnly = searchParams.get("active") === "true";

    const where: { userId: string; isActive?: boolean } = {
      userId: session.user.id,
    };
    if (activeOnly) {
      where.isActive = true;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = tasks.length > limit;
    const result = hasMore ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return NextResponse.json({
      tasks: result,
      nextCursor,
      hasMore,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { recurrenceDays, ...rest } = parsed.data;

    const task = await prisma.task.create({
      data: {
        ...rest,
        recurrenceDays: recurrenceDays ?? undefined,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
