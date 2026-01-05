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
