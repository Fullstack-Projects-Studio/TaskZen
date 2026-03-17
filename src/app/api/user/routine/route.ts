import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wakeSleepSchema } from "@/lib/validations/routine";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wakeUpTime: true, sleepTime: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Routine GET error:", error);
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = wakeSleepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        wakeUpTime: parsed.data.wakeUpTime,
        sleepTime: parsed.data.sleepTime,
      },
      select: { wakeUpTime: true, sleepTime: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Routine PUT error:", error);
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}
