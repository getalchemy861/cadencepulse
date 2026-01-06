import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { ReminderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, dueDate } = body;

    // Verify the reminder belongs to this user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: { status?: ReminderStatus; dueDate?: Date } = {};

    if (status) {
      if (!["PENDING", "DISMISSED", "COMPLETED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status as ReminderStatus;
    }

    if (dueDate) {
      updateData.dueDate = startOfDay(new Date(dueDate));
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error("Update reminder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the reminder belongs to this user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reminder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
