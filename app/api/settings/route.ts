import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { syncLookbackDays: true },
  });

  return NextResponse.json({
    syncLookbackDays: user?.syncLookbackDays ?? 30,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { syncLookbackDays } = body;

  // Validate syncLookbackDays
  if (syncLookbackDays !== undefined) {
    const days = Number(syncLookbackDays);
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: "syncLookbackDays must be between 1 and 365" },
        { status: 400 }
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(syncLookbackDays !== undefined && {
        syncLookbackDays: Number(syncLookbackDays),
      }),
    },
    select: { syncLookbackDays: true },
  });

  return NextResponse.json({
    syncLookbackDays: updatedUser.syncLookbackDays,
  });
}
