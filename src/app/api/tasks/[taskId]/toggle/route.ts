import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { isActive } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const result = await prisma.task.updateMany({
      where: { id: taskId, userId: session.user.id },
      data: { isActive },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.task.findUnique({ where: { id: taskId } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to toggle task" }, { status: 500 });
  }
}
