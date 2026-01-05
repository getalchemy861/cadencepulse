import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStatus } from "@/lib/pulse-logic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    include: {
      interactions: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { lastInteraction: "asc" },
  });

  // Recalculate status for each contact based on current time
  const contactsWithStatus = contacts.map((contact) => {
    const currentStatus = calculateStatus(
      contact.lastInteraction,
      contact.targetFrequency,
      contact.varianceBuffer
    );

    return {
      ...contact,
      status: currentStatus,
    };
  });

  // Sort by status priority: OVERDUE > IN_WINDOW > HEALTHY
  const statusPriority = { OVERDUE: 0, IN_WINDOW: 1, HEALTHY: 2 };
  contactsWithStatus.sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );

  return NextResponse.json(contactsWithStatus);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, company, targetFrequency, varianceBuffer } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Check if contact with same email already exists for this user
  const existingContact = await prisma.contact.findUnique({
    where: {
      email_userId: {
        email,
        userId: session.user.id,
      },
    },
  });

  if (existingContact) {
    return NextResponse.json(
      { error: "A contact with this email already exists" },
      { status: 409 }
    );
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      email,
      company: company || null,
      targetFrequency: targetFrequency || 30,
      varianceBuffer: varianceBuffer || 0.15,
      userId: session.user.id,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
