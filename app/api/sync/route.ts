import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getGmailClient,
  getCalendarClient,
  getLatestEmailTimestamp,
  getLatestMeetingTimestamp,
  refreshAccessToken,
} from "@/lib/google-api";
import { calculateStatus } from "@/lib/pulse-logic";
import { Source } from "@prisma/client";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's account with tokens
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "No Google account linked" },
      { status: 400 }
    );
  }

  let accessToken = account.access_token;

  // Check if token is expired and refresh if needed
  if (account.expires_at && account.expires_at * 1000 < Date.now()) {
    if (!account.refresh_token) {
      return NextResponse.json(
        { error: "Token expired and no refresh token available" },
        { status: 401 }
      );
    }

    const newToken = await refreshAccessToken(account.refresh_token);
    if (!newToken) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }

    accessToken = newToken;

    // Update the stored token
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: newToken,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    });
  }

  // Get all contacts for this user
  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
  });

  if (contacts.length === 0) {
    return NextResponse.json({ message: "No contacts to sync", synced: 0 });
  }

  const gmail = getGmailClient(accessToken);
  const calendar = getCalendarClient(accessToken);

  const results: {
    contactId: string;
    contactName: string;
    updated: boolean;
    newLastInteraction?: string;
    source?: string;
  }[] = [];

  for (const contact of contacts) {
    let latestInteraction: Date | null = null;
    let source: Source | null = null;

    // Check Gmail
    const emailTimestamp = await getLatestEmailTimestamp(gmail, contact.email);
    if (emailTimestamp && emailTimestamp > (latestInteraction || new Date(0))) {
      latestInteraction = emailTimestamp;
      source = Source.GMAIL;
    }

    // Check Calendar
    const meetingTimestamp = await getLatestMeetingTimestamp(
      calendar,
      contact.email
    );
    if (
      meetingTimestamp &&
      meetingTimestamp > (latestInteraction || new Date(0))
    ) {
      latestInteraction = meetingTimestamp;
      source = Source.CALENDAR;
    }

    // Update if we found a newer interaction
    if (latestInteraction && latestInteraction > contact.lastInteraction) {
      const newStatus = calculateStatus(
        latestInteraction,
        contact.targetFrequency,
        contact.varianceBuffer
      );

      // Create interaction record and update contact
      await prisma.$transaction([
        prisma.interaction.create({
          data: {
            source: source!,
            timestamp: latestInteraction,
            contactId: contact.id,
          },
        }),
        prisma.contact.update({
          where: { id: contact.id },
          data: {
            lastInteraction: latestInteraction,
            status: newStatus,
          },
        }),
      ]);

      results.push({
        contactId: contact.id,
        contactName: contact.name,
        updated: true,
        newLastInteraction: latestInteraction.toISOString(),
        source: source!,
      });
    } else {
      results.push({
        contactId: contact.id,
        contactName: contact.name,
        updated: false,
      });
    }
  }

  const syncedCount = results.filter((r) => r.updated).length;

  return NextResponse.json({
    message: `Synced ${syncedCount} of ${contacts.length} contacts`,
    synced: syncedCount,
    total: contacts.length,
    results,
  });
}
