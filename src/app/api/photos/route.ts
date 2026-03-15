import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { parseDateString, dayRange } from "@/lib/date-utils";

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

    const photos = await prisma.taskPhoto.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        task: { select: { id: true, title: true, category: true, color: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const taskId = formData.get("taskId") as string | null;
    const date = formData.get("date") as string | null;

    if (!image || !taskId || !date) {
      return NextResponse.json({ error: "image, taskId, and date are required" }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 });
    }

    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const dateObj = parseDateString(date);

    const existing = await prisma.taskPhoto.findFirst({
      where: { taskId, userId: session.user.id, date: dayRange(dateObj) },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Photo already exists for this task on this date" },
        { status: 409 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const folder = `taskzen/${session.user.id}`;
    const { url, publicId } = await uploadImage(buffer, folder);

    const photo = await prisma.taskPhoto.create({
      data: {
        taskId,
        userId: session.user.id,
        date: dateObj,
        imageUrl: url,
        publicId,
      },
    });

    return NextResponse.json({ action: "created", photo }, { status: 201 });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload photo" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Photo id is required" }, { status: 400 });
    }

    const photo = await prisma.taskPhoto.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await deleteImage(photo.publicId);
    await prisma.taskPhoto.delete({ where: { id } });

    return NextResponse.json({ action: "deleted", id });
  } catch (error) {
    console.error("Photo delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete photo" },
      { status: 500 }
    );
  }
}
