# Golf Charity Subscription Platform

Next.js 14 + Supabase + Stripe. PRD-aligned: scores, draws, charities, winner proof upload, admin tools.

## Deploy to Vercel

1. Push this repo to GitHub **without** `node_modules`, `.next`, or `.env.local` (see `.gitignore`).
2. Import the repo in [Vercel](https://vercel.com) and add the same env vars as local (Supabase URL/keys, Stripe, etc.).
3. Build command: `npm run build` (default).

## Environment

Copy `.env.example` → `.env.local` and fill real values (Supabase, Stripe). See project docs / PRD for full list.

## Supabase setup

Run migrations in order in the SQL Editor:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_full_schema.sql`
3. `supabase/migrations/0003_fix_profile_trigger_and_scores_rls.sql`
4. `supabase/migrations/0004_scores_ensure_date_played.sql` (if you see PGRST204 on `date_played`)
5. `supabase/seed.sql` (charities)

Create Storage bucket **`proofs`** (set **Public** so proof links open in the browser). Run **`supabase/migrations/0005_storage_proofs.sql`** so authenticated users can upload.

**Winner proofs:** saving `proof_url` uses **`SUPABASE_SERVICE_ROLE_KEY`** on the server (local `.env.local` and **Vercel env**). Without it, uploads appear to work in the UI but **do not persist** after refresh.

Enable **Email** auth.

### Admin user

Everyone signs up at `/auth/signup` as a subscriber. Promote an account:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
```

Sign out and sign in again. **Admins** are sent to **`/admin`** automatically after login; the nav also shows **Admin** + **Member area**.

## Where things live (PRD)

| Feature | Location |
|--------|----------|
| **Upload proof (subscriber)** | Logged in → **Member area** → sidebar **Winnings & upload proof** (`/dashboard/winnings`). Upload appears when you have a win with status *pending* and no proof yet. |
| **Review proof (admin)** | **`/admin/winners`** — **Winners & proof review**. Open **View** on the proof, then **Approve** / **Reject** (only when proof exists + pending). |
| **Draws / charities / users** | Other items in the **Admin** sidebar. |

### Winner amounts show $0.00

Prize money is **not** automatic: on **Admin → Draw Management**, **Total Prize Pool ($)** must be **greater than 0** when you click **Publish Official Draw**. The app splits it **40% / 35% / 25%** across 5 / 4 / 3-match tiers and divides each tier among winners in that tier.

- **New draws:** enter e.g. `10000` before publishing (the API now rejects `$0` publishes).
- **Already-published draw with $0 winners:** In Supabase, check **`draws`** for `pool_5_match`, `pool_4_match`, `pool_3_match`. If those are `0`, update that draw row with the correct pool dollars, then run **`supabase/scripts/recalc_winner_amounts.sql`** in the SQL Editor.

## Local dev

```bash
npm install
npm run dev
```

Use `npm run clean` to remove `.next` before a fresh build.

## Removed / unused

- Unused API route `POST /api/auth/login` (login uses the Supabase client in the browser).
- Unused `services/score-manager.ts`.
- Unused deps: `framer-motion`, `zod` (re-add if you use them later).
