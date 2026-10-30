# P2Q

P2Q turns an attached source file into an AI-generated quiz prompt, imports the resulting JSON, and tracks your attempts. Sign-in is Google-only, and every quiz and attempt is private to its owner.

## Features

- Google sign-in with database-backed sessions via Auth.js
- Private dashboard, library, quizzes, and attempt history
- Prompt builder for attached-file quizzes with difficulty, language, question count, and question types
- Import validation for single-choice, multi-select, and true/false questions
- Exam and study modes with server-side grading
- Dashboard stats and recent activity
- Paper Trail light/dark theme

## Tech Stack

- Next.js 16 with App Router, Cache Components, and Partial Prefetching
- React 19
- TypeScript
- PostgreSQL and Prisma 7
- Auth.js v5 with the Prisma adapter
- Tailwind CSS 4, Base UI, and shadcn
- Zod and Vitest

## Requirements

- Node.js in the supported Prisma ranges: `20.x >= 20.19`, `22.x >= 22.12`, or `>= 24`
- PostgreSQL running locally or remotely
- A Google OAuth client

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local database, if needed:

   ```bash
   createdb p2q
   ```

3. Create `.env` from `.env.example` and fill in the values:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/p2q?schema=public"
   AUTH_SECRET="..."
   AUTH_URL="http://localhost:3000"
   AUTH_GOOGLE_ID="..."
   AUTH_GOOGLE_SECRET="..."
   ```

   Generate `AUTH_SECRET` with:

   ```bash
   npx auth secret
   ```

4. Apply migrations and generate the Prisma client:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000` and sign in with Google.

The database starts empty. There is no sample quiz or seed script.

## Google OAuth

Create an OAuth client in the Google Cloud Console with type **Web application**.

Add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

For local development, add this authorized JavaScript origin:

```text
http://localhost:3000
```

If the OAuth consent screen is in testing mode, add your Google account as a test user. Use the generated client ID for `AUTH_GOOGLE_ID` and the client secret for `AUTH_GOOGLE_SECRET`.

For production, update `AUTH_URL` and add the deployed callback URL:

```text
https://your-domain.com/api/auth/callback/google
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset the database and regenerate the Prisma client |

`npm run db:reset` deletes all local data.

## Authentication and Ownership

- Auth.js uses the `User`, `Account`, `Session`, and `VerificationToken` models.
- Sessions are stored in PostgreSQL, not in JWTs.
- `proxy.ts` performs an optimistic cookie check for dashboard routes.
- Authorization is enforced on the server through `requireUser()` in `lib/dal.ts`.
- Every quiz and attempt has a required `userId`.
- Data reads and server actions are scoped to the signed-in user. Cross-user quiz IDs resolve as not found.
- Correct answers are never sent to the browser before grading.

## Project Structure

```text
app/
  api/auth/            Auth.js route handler
  dashboard/           Authenticated dashboard, library, create flow, quiz runner
  login/               Google sign-in page and action
components/
  dashboard/           Dashboard shell, navigation, account panel
  quiz/                Quiz creation, library, and play UI
  ui/                  Shared UI primitives
lib/
  auth.ts              Auth.js configuration
  dal.ts               Session helpers and requireUser()
  data/quizzes.ts      Owner-scoped data access
  quiz/                Prompt generation, schemas, and play helpers
prisma/
  schema.prisma        Database models
  migrations/          Applied migrations
```

The generated Prisma client is written to `lib/generated/prisma` and is ignored by Git.
