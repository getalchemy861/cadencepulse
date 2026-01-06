import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SuggestedContactStatus } from "@prisma/client";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const suggestions = await prisma.suggestedContact.findMany({
    where: {
      userId: session.user.id,
      status: SuggestedContactStatus.PENDING,
    },
    orderBy: [{ emailCount: "desc" }, { lastEmailed: "desc" }],
    take: 20,
  });

  return NextResponse.json(suggestions);
}
