import { google, gmail_v1, calendar_v3 } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export function getGmailClient(accessToken: string): gmail_v1.Gmail {
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export function getCalendarClient(accessToken: string): calendar_v3.Calendar {
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Get the timestamp of the most recent sent email to a contact
 */
export async function getLatestEmailTimestamp(
  gmail: gmail_v1.Gmail,
  contactEmail: string
): Promise<Date | null> {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `to:${contactEmail} in:sent`,
      maxResults: 1,
    });

    const messages = response.data.messages;
    if (!messages || messages.length === 0) {
      return null;
    }

    const message = await gmail.users.messages.get({
      userId: "me",
      id: messages[0].id!,
      format: "metadata",
      metadataHeaders: ["Date"],
    });

    const dateHeader = message.data.payload?.headers?.find(
      (h) => h.name === "Date"
    );

    if (dateHeader?.value) {
      return new Date(dateHeader.value);
    }

    // Fallback to internalDate
    if (message.data.internalDate) {
      return new Date(parseInt(message.data.internalDate, 10));
    }

    return null;
  } catch (error) {
    console.error(`Error fetching emails for ${contactEmail}:`, error);
    return null;
  }
}

/**
 * Get the timestamp of the most recent calendar event with a contact
 */
export async function getLatestMeetingTimestamp(
  calendar: calendar_v3.Calendar,
  contactEmail: string
): Promise<Date | null> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: oneYearAgo.toISOString(),
      timeMax: now.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      q: contactEmail,
    });

    const events = response.data.items;
    if (!events || events.length === 0) {
      return null;
    }

    // Filter events where the contact is an attendee and find the most recent
    const eventsWithContact = events.filter((event) =>
      event.attendees?.some(
        (attendee) =>
          attendee.email?.toLowerCase() === contactEmail.toLowerCase()
      )
    );

    if (eventsWithContact.length === 0) {
      return null;
    }

    // Get the most recent event (last in the sorted list)
    const mostRecent = eventsWithContact[eventsWithContact.length - 1];
    const startTime = mostRecent.start?.dateTime || mostRecent.start?.date;

    if (startTime) {
      return new Date(startTime);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching calendar events for ${contactEmail}:`, error);
    return null;
  }
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token || null;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export interface RecipientInfo {
  email: string;
  name: string | null;
  lastEmailed: Date;
  emailCount: number;
}

/**
 * Parse email address from "Name <email>" or plain email format
 */
function parseEmailAddress(raw: string): { email: string; name: string | null } | null {
  const trimmed = raw.trim();

  // Match "Name <email@domain.com>" format
  const bracketMatch = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (bracketMatch) {
    return {
      name: bracketMatch[1].trim().replace(/^["']|["']$/g, ""),
      email: bracketMatch[2].trim().toLowerCase(),
    };
  }

  // Plain email
  const emailMatch = trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (emailMatch) {
    return { email: trimmed.toLowerCase(), name: null };
  }

  return null;
}

/**
 * Check if an email should be filtered out (noreply, automated, etc.)
 */
function shouldFilterEmail(email: string): boolean {
  const filterPatterns = [
    /^noreply@/i,
    /^no-reply@/i,
    /^notifications?@/i,
    /^support@/i,
    /^info@/i,
    /^help@/i,
    /^mailer-daemon@/i,
    /^postmaster@/i,
    /^feedback@/i,
    /^newsletter@/i,
    /^updates@/i,
    /^alerts?@/i,
    /^donotreply@/i,
    /^do-not-reply@/i,
    /^admin@/i,
    /^automated@/i,
    /^system@/i,
  ];

  return filterPatterns.some((pattern) => pattern.test(email));
}

/**
 * Scan sent emails from the last 6 months and extract unique recipients
 */
export async function scanSentEmailsForRecipients(
  gmail: gmail_v1.Gmail,
  userEmail: string
): Promise<RecipientInfo[]> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const afterDate = sixMonthsAgo.toISOString().split("T")[0].replace(/-/g, "/");

    // Fetch sent emails from last 6 months
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `in:sent after:${afterDate}`,
      maxResults: 200,
    });

    const messages = response.data.messages;
    if (!messages || messages.length === 0) {
      return [];
    }

    // Aggregate recipients by email
    const recipientMap = new Map<string, RecipientInfo>();
    const userEmailLower = userEmail.toLowerCase();

    // Fetch headers for each message
    for (const msg of messages) {
      if (!msg.id) continue;

      try {
        const message = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["To", "Cc", "Date"],
        });

        const headers = message.data.payload?.headers || [];
        const toHeader = headers.find((h) => h.name === "To")?.value || "";
        const ccHeader = headers.find((h) => h.name === "Cc")?.value || "";
        const dateHeader = headers.find((h) => h.name === "Date")?.value;

        const emailDate = dateHeader
          ? new Date(dateHeader)
          : message.data.internalDate
          ? new Date(parseInt(message.data.internalDate, 10))
          : new Date();

        // Parse all recipients from To and Cc
        const allRecipients = `${toHeader},${ccHeader}`
          .split(",")
          .map((r) => parseEmailAddress(r))
          .filter((r): r is { email: string; name: string | null } => r !== null);

        for (const recipient of allRecipients) {
          // Filter out user's own email and automated addresses
          if (
            recipient.email === userEmailLower ||
            shouldFilterEmail(recipient.email)
          ) {
            continue;
          }

          const existing = recipientMap.get(recipient.email);
          if (existing) {
            existing.emailCount++;
            if (emailDate > existing.lastEmailed) {
              existing.lastEmailed = emailDate;
              // Update name if we have one and didn't before
              if (recipient.name && !existing.name) {
                existing.name = recipient.name;
              }
            }
          } else {
            recipientMap.set(recipient.email, {
              email: recipient.email,
              name: recipient.name,
              lastEmailed: emailDate,
              emailCount: 1,
            });
          }
        }
      } catch (error) {
        // Skip messages that fail to fetch
        console.error(`Error fetching message ${msg.id}:`, error);
        continue;
      }
    }

    // Convert to array and sort by email count (most frequent first)
    return Array.from(recipientMap.values()).sort(
      (a, b) => b.emailCount - a.emailCount
    );
  } catch (error) {
    console.error("Error scanning sent emails:", error);
    return [];
  }
}
