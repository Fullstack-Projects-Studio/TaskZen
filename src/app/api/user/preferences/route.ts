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
      select: {
        morningReminder: true,
        eveningReminder: true,
        wakeUpTime: true,
        sleepTime: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Preferences GET error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { morningReminder, eveningReminder } = body;

    // Validate HH:MM format or null
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (morningReminder !== null && morningReminder !== undefined && !timeRegex.test(morningReminder)) {
      return NextResponse.json({ error: "Invalid morning reminder format" }, { status: 400 });
    }
    if (eveningReminder !== null && eveningReminder !== undefined && !timeRegex.test(eveningReminder)) {
      return NextResponse.json({ error: "Invalid evening reminder format" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        morningReminder: morningReminder || null,
        eveningReminder: eveningReminder || null,
      },
      select: {
        morningReminder: true,
        eveningReminder: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Preferences PUT error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
