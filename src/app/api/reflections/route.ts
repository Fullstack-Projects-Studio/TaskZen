import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reflectionSchema } from "@/lib/validations/reflection";

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

    const reflections = await prisma.dailyReflection.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(reflections);
  } catch (error) {
    console.error("Reflections GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reflections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reflectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const dateObj = new Date(parsed.data.date + "T00:00:00Z");

    const reflection = await prisma.dailyReflection.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: dateObj,
        },
      },
      update: {
        content: parsed.data.content,
        mood: parsed.data.mood,
      },
      create: {
        userId: session.user.id,
        date: dateObj,
        content: parsed.data.content,
        mood: parsed.data.mood,
      },
    });

    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    console.error("Reflections POST error:", error);
    return NextResponse.json({ error: "Failed to save reflection" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.dailyReflection.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Reflections DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete reflection" }, { status: 500 });
  }
}
