# Save the Date — Three Designs

Three distinct save-the-date landing pages for the same wedding, built with
**Next.js (App Router) + Tailwind CSS**. Pick the design that feels most like you.

| Route | Design | Mood | Palette source |
|-------|--------|------|----------------|
| `/version-1` | **Modern New York** | Sleek, editorial, city-light drama | `source-material/scheme1.jpg` |
| `/version-2` | **Connecticut Backyard** | Warm, inviting, "feels like home" | `source-material/scheme2.jpg` |
| `/version-3` | **New England Floral** | Simple, elegant, in full bloom | `source-material/scheme3.jpg` |

The home page (`/`) is a chooser that previews all three.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content — one file

All wedding details live in [`src/config/site.ts`](src/config/site.ts). Update the
`wedding` object (names, date, venue, message, RSVP-by date) once and it flows to
all three pages, the countdown, and the "Add to Calendar" files.

> The names/date/venue currently in the config are tasteful **placeholders**
> (clearly marked with `// PLACEHOLDER`). Swap them for the real details.

## Showing / hiding sections (feature flags)

Each version has per-section flags in the same config file. Set any to `false` to
hide that section on that page:

```ts
versions.v1.flags = {
  hero: true, countdown: true, gallery: true, details: true, rsvp: true,
}
```

## Photos

Curated proposal photos live in [`public/photos/`](public/photos). The gallery set
and each version's hero/accent image are chosen in `src/config/site.ts`
(`galleryPhotos`, `versions.*.hero`, `versions.*.accentImage`).

## Features

- **Hero** — full-bleed photo with the couple's names, animated reveal
- **Countdown** — live countdown to the wedding date
- **Gallery** — masonry grid with a keyboard-navigable lightbox
- **Ceremony** — "details to come" placeholder section (date accent + note)
- **Details + Add to Calendar** — Google Calendar link + downloadable `.ics`
- **RSVP** — form that persists to Supabase, with a password-protected dashboard

## RSVP storage + admin dashboard

Submissions are stored in **Supabase (Postgres)** and viewable at **`/admin`**,
gated by a single shared password.

### One-time setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL editor**, run [`supabase/schema.sql`](supabase/schema.sql)
   to create the `rsvps` table.
3. Copy [`.env.example`](.env.example) to `.env.local` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API
   - `ADMIN_PASSWORD` — the password to view RSVPs
   - `ADMIN_SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
4. When deploying to **Vercel/Netlify**, add the same four variables in the host's
   environment settings.

### How it works

- The public RSVP form posts to [`/api/rsvp`](src/app/api/rsvp/route.ts), which
  validates and inserts using the **service-role** key (server-only — never
  exposed to the browser). The table has Row Level Security on with no public
  policies, so the anon key can't read or write it.
- [`/admin`](src/app/admin/page.tsx) shows a login form; the correct password sets
  an HMAC-signed, httpOnly session cookie ([`src/lib/auth.ts`](src/lib/auth.ts)).
  Once in, you see summary stats, the full response table, **Export CSV**, and
  **Sign out**.
- Until Supabase env vars are set, the form and dashboard degrade gracefully with
  a clear "not configured" message (no crashes).

### Keeping Supabase awake (free tier)

Free Supabase projects pause after ~7 days of inactivity. To prevent that,
[`vercel.json`](vercel.json) defines a **daily Vercel Cron** that hits
[`/api/health`](src/app/api/health/route.ts), which runs a tiny database query —
enough activity to keep the project from pausing. No external service needed.
(Vercel Cron runs once per day on the free Hobby plan, which is plenty.)

> **Local quick-start:** a gitignored `.env.local` is included with a test admin
> password (`test-secret-123`) so `/admin` works immediately. Replace it (and add
> Supabase keys) before going live.

## Structure

```
src/
  app/
    page.tsx              # chooser / index
    version-1/page.tsx    # Modern New York
    version-2/page.tsx    # Connecticut Backyard
    version-3/page.tsx    # New England Floral
    admin/                # password-gated RSVP dashboard (page, login, actions)
    api/rsvp/route.ts     # persists a submission to Supabase
    api/admin/export/     # CSV export (auth-gated)
    layout.tsx            # fonts + global styles
  components/             # Countdown, Gallery, RSVPForm, AddToCalendar, Reveal
  config/site.ts         # <- edit details + feature flags here
  lib/
    calendar.ts          # Google Calendar URL + .ics generation
    supabase.ts          # server-only Supabase client
    auth.ts              # admin session (signed cookie)
supabase/schema.sql      # run once to create the rsvps table
```
