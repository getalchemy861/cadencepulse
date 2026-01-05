import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Status, Source } from "@prisma/client";

export async function POST(
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

  const now = new Date();

  // Create interaction and update contact in a transaction
  const [interaction, contact] = await prisma.$transaction([
    prisma.interaction.create({
      data: {
        source: Source.MANUAL,
        timestamp: now,
        contactId: id,
      },
    }),
    prisma.contact.update({
      where: { id },
      data: {
        lastInteraction: now,
        status: Status.HEALTHY,
      },
    }),
  ]);

  return NextResponse.json({ interaction, contact });
}
