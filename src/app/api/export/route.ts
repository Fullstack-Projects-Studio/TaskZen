import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

const CHUNK_SIZE = 1000;

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Use a ReadableStream so we never hold the entire CSV in memory
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        function push(text: string) {
          controller.enqueue(encoder.encode(text));
        }

        // --- Tasks section (usually small, fetch all at once) ---
        const tasks = await prisma.task.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
        });

        push("=== TASKS ===\n");
        push("Title,Category,Recurrence,Scheduled Time,Active,Created\n");

        for (const t of tasks) {
          push(
            [
              csvEscape(t.title),
              csvEscape(t.category),
              t.recurrence,
              t.scheduledTime || "",
              t.isActive ? "Yes" : "No",
              format(new Date(t.createdAt), "yyyy-MM-dd"),
            ].join(",") + "\n"
          );
        }

        push("\n");

        // --- Completions section (can be huge — stream in chunks) ---
        push("=== COMPLETIONS ===\n");
        push("Task,Category,Date,Completed At\n");

        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const completions = await prisma.taskCompletion.findMany({
            where: { userId },
            include: { task: { select: { title: true, category: true } } },
            orderBy: { date: "asc" },
            take: CHUNK_SIZE + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          });

          hasMore = completions.length > CHUNK_SIZE;
          const batch = hasMore ? completions.slice(0, CHUNK_SIZE) : completions;

          for (const c of batch) {
            push(
              [
                csvEscape(c.task.title),
                csvEscape(c.task.category),
                format(new Date(c.date), "yyyy-MM-dd"),
                format(new Date(c.completedAt), "yyyy-MM-dd HH:mm"),
              ].join(",") + "\n"
            );
          }

          if (batch.length > 0) {
            cursor = batch[batch.length - 1].id;
          } else {
            hasMore = false;
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="taskzen-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
