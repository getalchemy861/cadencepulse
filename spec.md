1. Project Overview
Product Name: Pulse

Description: A lightweight relationship management tool that tracks the "cadence" of professional interactions. It uses AI-driven windows to prompt outreach and automatically updates "Last Contacted" dates by syncing with Google Workspace (Gmail & Calendar).

Core Philosophy: Professional relationships shouldn't feel robotic. Pulse moves away from fixed-date reminders (e.g., "every 30 days") to organic "contact windows."

2. Infrastructure & Tech Stack
Framework: Next.js 14+ (App Router)

Styling: Tailwind CSS + shadcn/ui + Lucide Icons

Authentication: Auth.js (NextAuth) with Google Provider

Database: Supabase (PostgreSQL) via Prisma ORM

Hosting: Vercel

APIs: Google Gmail API (Metadata only), Google Calendar API

3. Core Logic: The Dynamic Pulse
To prevent outreach from appearing automated, the system uses a variance-based window:

Target Frequency: User-defined (e.g., 30 days).

The Window: Target Frequency +/- 15% (Variance Buffer).

Status States:

Healthy (Green): Days since last interaction < 85% of target frequency.

In-Window (Yellow): Days since last interaction is between 85% and 115% of target frequency. (The "Sweet Spot").

Overdue (Red): Days since last interaction > 115% of target frequency.

4. Database Schema (Prisma)
Code snippet

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  accessToken       String?   // OAuth Access Token
  refreshToken      String?   // OAuth Refresh Token (Required for background sync)
  tokenExpiresAt    DateTime?
  contacts          Contact[]
}

model Contact {
  id               String        @id @default(cuid())
  name             String
  email            String        @unique
  company          String?
  targetFrequency  Int           @default(30) // In days
  varianceBuffer   Float         @default(0.15) 
  lastInteraction  DateTime      @default(now())
  nextScheduledAt  DateTime?     // Calculated via AI Logic
  status           Status        @default(HEALTHY)
  userId           String
  user             User          @relation(fields: [userId], references: [id])
  interactions     Interaction[]
}

enum Status {
  HEALTHY
  IN_WINDOW
  OVERDUE
}

model Interaction {
  id         String   @id @default(cuid())
  source     Source   // GMAIL, CALENDAR, MANUAL
  timestamp  DateTime @default(now())
  contactId  String
  contact    Contact  @relation(fields: [contactId], references: [id])
}

enum Source {
  GMAIL
  CALENDAR
  MANUAL
}
5. Functional Requirements
5.1 Google Workspace Integration
OAuth Scopes: openid, email, profile, https://www.googleapis.com/auth/gmail.readonly, https://www.googleapis.com/auth/calendar.events.readonly.

Gmail Sync: Search to:{contact_email} in the user's sent folder. Retrieve ONLY the timestamp of the latest message. Do not store email bodies.

Calendar Sync: Search for past events where the contact_email was an attendee.

Auto-Update: If a new interaction is found via sync, update lastInteraction and move the contact status back to "HEALTHY."

5.2 The Dashboard (UI/UX)
Traffic Light View: A list of contacts sorted by urgency (Red > Yellow > Green).

Quick-Log Action: A prominent "Log Check-in" button to manually reset the timer for offline interactions (coffee, phone call).

AI Sweet Spot: For contacts in the "Yellow" window, display a suggestion like: "Today is a great day to ping [Name]—you're within your monthly window."

6. Directory Structure
Plaintext

/app
  /api/auth/[...nextauth]/route.ts  # NextAuth logic
  /api/sync/route.ts                # Google API polling logic
  /dashboard/page.tsx               # Main UI (using mockup.tsx logic)
/components
  /ui                               # shadcn components
  /dashboard/contact-list.tsx       # Main Table/Card list
/lib
  /prisma.ts                        # Client initialization
  /google-api.ts                    # Gmail/Calendar fetchers
  /pulse-logic.ts                   # Variance & status calculations
7. Security & Deployment
Token Security: Store Google refresh_token securely.

Vercel Hosting: Deploy as a standard Next.js app.

Environment Variables:

DATABASE_URL: Supabase Connection String.

GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET: From Google Cloud Console.

NEXTAUTH_SECRET: Random string for encryption.

8. Implementation Roadmap (Phase 1)
Initial Setup: Initialize Next.js, Tailwind, and shadcn.

Database: Connect Prisma to Supabase and push the schema.

Auth: Implement Google OAuth with "offline" access type for refresh tokens.

UI: Build the Dashboard using dummy data and the provided mockup.tsx as a guide.

Logic: Implement the background sync/polling function for Google APIs.