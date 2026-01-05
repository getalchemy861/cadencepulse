# Pulse: Relationship Health Dashboard

**Pulse** is a smart CRM utility designed for professionals who want to maintain their network without the robotic feel of traditional reminders. It uses "Dynamic Cadence" tracking to suggest the best time to reach out within a natural window.

## Core Features

- **Dynamic Pulse Logic:** Reminders are calculated with a +/- 15% variance window.
- **Google Workspace Integration:** Automatically updates contact status by monitoring sent emails (Gmail) and calendar invites (Google Calendar).
- **Privacy-First:** We only sync metadata (timestamps). We never read or store the body of your emails.
- **Traffic Light UI:** Visual feedback on Healthy (Green), In-Window (Yellow), and Overdue (Red) relationships.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Auth.js v5 (NextAuth), Prisma ORM
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cadencepulse
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="your-random-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the connection string from Settings > Database > Connection String (URI)
3. Add it to your `.env.local` as `DATABASE_URL`

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > OAuth consent screen**
   - Choose "External" user type
   - Fill in app name, user support email, developer contact
   - Add scopes: `openid`, `email`, `profile`
   - Add test users (your email)
4. Navigate to **APIs & Services > Credentials**
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to `.env.local`
6. Enable the required APIs:
   - Go to **APIs & Services > Library**
   - Enable "Gmail API"
   - Enable "Google Calendar API"

### 5. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
/app
  /api
    /auth/[...nextauth]   # Auth.js handlers
    /contacts             # Contacts CRUD
    /contacts/[id]        # Single contact operations
    /contacts/[id]/checkin # Manual check-in
    /sync                 # Google sync endpoint
  /dashboard              # Main dashboard page
  page.tsx                # Landing page
/components
  /ui                     # shadcn components
  /dashboard              # Dashboard components
  /providers              # Context providers
/lib
  auth.ts                 # Auth.js configuration
  prisma.ts               # Prisma client
  pulse-logic.ts          # Status calculation logic
  google-api.ts           # Gmail/Calendar API helpers
/prisma
  schema.prisma           # Database schema
```

## Status Logic

Pulse uses a variance-based window to determine contact status:

| Status | Condition |
|--------|-----------|
| **Healthy** (Green) | Days since interaction < 85% of target |
| **In-Window** (Yellow) | Days since interaction between 85-115% of target |
| **Overdue** (Red) | Days since interaction > 115% of target |

Example with 30-day target:
- **Healthy:** 0-25 days
- **In-Window:** 26-34 days (the "sweet spot")
- **Overdue:** 35+ days

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to add all environment variables in Vercel's project settings.

For production Google OAuth:
1. Update OAuth consent screen to "Production" status
2. Add your production domain to authorized redirect URIs

## License

MIT
