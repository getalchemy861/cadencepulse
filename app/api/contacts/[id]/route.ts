import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      interactions: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, company, targetFrequency, varianceBuffer } = body;

  // Verify ownership
  const existingContact = await prisma.contact.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingContact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(company !== undefined && { company }),
      ...(targetFrequency && { targetFrequency }),
      ...(varianceBuffer !== undefined && { varianceBuffer }),
    },
  });

  return NextResponse.json(contact);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existingContact = await prisma.contact.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingContact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
