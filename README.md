# BOK MyHome

Real estate sales & resale marketplace for Dhanbad — Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma.

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit http://localhost:3000. Seeded demo accounts:

- Admin: `admin@bokmyhome.com` / `Admin@123`
- Agent: `agent@bokmyhome.com` / `Agent@123`

## Notes

- Database is SQLite by default (`prisma/schema.prisma`) for zero-config local dev. Switch the
  `datasource` provider to `postgresql` for production — fields that would be native enums are
  plain `String` columns (SQLite has no enum support); canonical value lists live in
  `src/lib/constants.ts`.
- Property photos under `public/images/properties` are generated placeholders
  (`scripts/gen-placeholder-images.mjs`) — outbound access to stock-photo CDNs is blocked in the
  environment this was built in. Swap them for real photography via the admin property form's
  image URL field, or wire up a proper upload pipeline (S3/Cloudinary/etc.) in place of the current
  base64-inline uploads used on the "Sell Your Property" form.
- Auth is a minimal JWT-in-cookie implementation (`src/lib/auth.ts`) — good enough for this build,
  but swap in a proper auth provider (NextAuth/Clerk/etc.) before real production use, and set a
  strong `JWT_SECRET`.
