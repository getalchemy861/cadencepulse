import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
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
      orderBy: { dueDate: "asc" },
    });

    // Count reminders due today or earlier
    const today = endOfDay(new Date());
    const dueCount = reminders.filter(
      (r) => new Date(r.dueDate) <= today
    ).length;

    return NextResponse.json({ reminders, dueCount });
  } catch (error) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, dueDate, note } = body;

    if (!contactId || !dueDate) {
      return NextResponse.json(
        { error: "Contact ID and due date are required" },
        { status: 400 }
      );
    }

    // Verify the contact belongs to this user
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Create reminder with date set to start of day (date only, no time)
    const reminder = await prisma.reminder.create({
      data: {
        dueDate: startOfDay(new Date(dueDate)),
        note: note || null,
        contactId,
        userId: session.user.id,
      },
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

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create reminder" },
      { status: 500 }
    );
  }
}
