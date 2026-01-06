import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStatus } from "@/lib/pulse-logic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get the suggestion
  const suggestion = await prisma.suggestedContact.findUnique({
    where: { id },
  });

  if (!suggestion) {
    return NextResponse.json(
      { error: "Suggestion not found" },
      { status: 404 }
    );
  }

  if (suggestion.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Parse request body for optional fields
  const body = await request.json().catch(() => ({}));
  const { targetFrequency = 30, company } = body;

  // Calculate initial status based on lastEmailed date
  const status = calculateStatus(
    suggestion.lastEmailed,
    targetFrequency,
    0.15 // default variance buffer
  );

  // Create the contact and delete the suggestion in a transaction
  const [contact] = await prisma.$transaction([
    prisma.contact.create({
      data: {
        email: suggestion.email,
        name: suggestion.name || suggestion.email.split("@")[0],
        company: company || null,
        targetFrequency,
        varianceBuffer: 0.15,
        lastInteraction: suggestion.lastEmailed,
        status,
        userId: session.user.id,
      },
    }),
    prisma.suggestedContact.delete({
      where: { id },
    }),
  ]);

  return NextResponse.json(contact);
}
