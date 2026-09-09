# BOK MyHome

Real estate sales & resale marketplace for Dhanbad — Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL (Supabase).

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL for your own Postgres instance
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit http://localhost:3000. Seeded demo accounts:

- Admin: `admin@bokmyhome.com` / `Admin@123`
- Agent: `agent@bokmyhome.com` / `Agent@123`

## Deployment

Deployed on Vercel, backed by a Supabase Postgres project. Required environment variables:
`DATABASE_URL` (a direct or pooled Postgres connection string) and `JWT_SECRET`.

## Notes

- Fields that would naturally be native enums (Role, PropertyType, TransactionType, etc.) are kept
  as plain `String` columns rather than Postgres enums, since the schema started on SQLite — see
  `src/lib/constants.ts` for the canonical value lists.
- Property photos under `public/images/properties` are generated placeholders
  (`scripts/gen-placeholder-images.mjs`) — outbound access to stock-photo CDNs is blocked in the
  environment this was built in. Swap them for real photography via the admin property form's
  image URL field, or wire up a proper upload pipeline (S3/Cloudinary/etc.) in place of the current
  base64-inline uploads used on the "Sell Your Property" form.
- Auth is a minimal JWT-in-cookie implementation (`src/lib/auth.ts`) — good enough for this build,
  but swap in a proper auth provider (NextAuth/Clerk/etc.) before real production use, and set a
  strong `JWT_SECRET`.
- **Security**: the Supabase project's Row Level Security is currently disabled on all tables (see
  the security note in the PR/handoff notes) — the app itself only talks to Postgres directly via a
  dedicated `app_user` role (never the Supabase anon/publishable key), but Supabase's auto-generated
  PostgREST API is reachable by anyone with the project's anon key unless RLS is enabled. Recommended
  fix: grant `app_user` the `BYPASSRLS` attribute, then enable RLS on every table — this closes the
  public PostgREST exposure without affecting the app (which never goes through PostgREST).
