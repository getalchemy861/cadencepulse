import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SuggestedContactStatus } from "@prisma/client";

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

  // Update status back to PENDING
  await prisma.suggestedContact.update({
    where: { id },
    data: { status: SuggestedContactStatus.PENDING },
  });

  return NextResponse.json({ success: true });
}
