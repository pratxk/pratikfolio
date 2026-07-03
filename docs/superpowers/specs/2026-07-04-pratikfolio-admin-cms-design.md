# Pratikfolio Admin CMS — Design Spec

**Date:** 2026-07-04
**Project:** `pratikfolio` (Next.js 15, App Router, deployed on Vercel)
**Author:** Pratik Singh

## 1. Problem & Goal

The portfolio is entirely driven by a single `CONFIG.json` that is **statically imported** in ~19 files (pages, components, middleware) and therefore baked into the build. Editing it today means hand-editing JSON and redeploying.

**Goal:** a secure, email/password-protected **admin dashboard** at `/admin` that lets the owner create, read, update, delete, and **reorder** every part of the portfolio — site metadata, theme, home (skills, experience, about, GitHub stats), project cards, rich project detail pages, contact + social links, the "Connect With Me" dropdown, footer, and privacy — with image uploads, and have changes appear on the **live site within seconds and no redeploy**.

Secondary goal: remove the GitHub "forked from maximjsx/portfolio" appearance while remaining **AGPL-3.0 compliant**.

## 2. Decisions (locked)

| Area | Decision |
|---|---|
| Persistence | **Fully dynamic, DB-backed.** Config source of truth in MongoDB; site reads via cached loader + on-demand revalidation. |
| Database | **MongoDB Atlas** (free tier). Config is deeply nested JSON → stored as a document ~1:1. |
| Image storage | **Cloudinary** (free tier), direct signed uploads. |
| Auth | Email + password vs DB (bcrypt hash), signed **HttpOnly JWT** session cookie (`jose`). Single admin. |
| Editor UX | Full section editor, **drag-and-drop reorder** (`@dnd-kit`), Cloudinary uploads, add/edit/delete everywhere. |
| De-fork | Recreate repo as standalone; **keep** AGPL `LICENSE` + upstream copyright headers, **add** owner copyright + footer credit. |
| Testing | TDD, 80%+ (unit + integration + component, optional E2E). |

## 3. Architecture

```
┌───────────────────────────── Public site (unchanged UX) ─────────────────────────────┐
│  layout.js (server) ── getConfig() ──► <ConfigProvider> (client context)               │
│  server components ── getConfig()                                                       │
│  client components ── useConfig()          (was: import config from "/CONFIG.json")     │
└───────────────────────────────────────────────────────────────────────────────────────┘
                    ▲ cached (unstable_cache, tag "config")           │ revalidateTag("config")
                    │                                                 │
┌───────── Data layer ─────────┐                          ┌───────── Admin ──────────┐
│ src/lib/db.js  (Mongo client)│◄─────────────────────────│ /api/admin/* route handlers│
│ src/lib/config-service.js    │   read/write config      │ (auth-gated, zod-validated)│
│  getConfig / updateConfig    │                          │ /admin/* UI (React forms)  │
└──────────────────────────────┘                          └────────────────────────────┘
        │                                                          │ signed upload
   MongoDB Atlas                                              Cloudinary
   (config, admins)                                           (images → secure_url)
```

### 3.1 Data layer (`src/lib/`)
- **`db.js`** — MongoDB client singleton, safe across HMR and serverless (cached on `globalThis`).
- **`config-service.js`**
  - `getConfig()` — returns the config `data`. Wrapped in `unstable_cache` with tag `"config"`. **Fallback:** if `MONGODB_URI` is unset or the singleton doc is missing, return the bundled `CONFIG.json` so a fresh clone still builds and runs.
  - `updateConfig(nextData)` — validate → write singleton → `revalidateTag("config")`.
  - Small helpers for array section reorders (cards, skills, experience, social links).
- **`schema.js`** — zod schema for the whole config; validates at the API boundary. Mirrors current `CONFIG.json` structure.

### 3.2 Collections
- **`config`**: `{ _id: "singleton", data: <full portfolio config>, updatedAt: Date }`.
- **`admins`**: `{ _id, email: string (unique), passwordHash: string, createdAt: Date }`.

### 3.3 Seed (`scripts/seed.js`)
Idempotent: upsert `config.singleton` from the repo's `CONFIG.json`; upsert admin from `ADMIN_EMAIL` + bcrypt(`ADMIN_PASSWORD`). Run once locally and once against production DB.

## 4. Auth

- **`POST /api/admin/login`** `{ email, password }` → look up admin, `bcrypt.compare`, on success sign JWT (`jose`, HS256, `AUTH_SECRET`, 7-day exp) and set cookie `admin_session` (HttpOnly, Secure in prod, SameSite=Lax, Path=/). Generic error on failure. In-memory rate-limit (e.g., 5/min/IP) to blunt brute force.
- **`POST /api/admin/logout`** → clear cookie.
- **`middleware.js`** — extend existing middleware: for `/admin` (except `/admin/login`) and `/api/admin` (except `/api/admin/login`), verify the JWT; redirect UI to `/admin/login`, return 401 for API. Keep the existing `/` → home redirect.
- Passwords: `bcryptjs`. No plaintext ever stored or logged.

## 5. Admin API (`/api/admin/*`, all auth-gated except login)

| Method | Route | Body / Result |
|---|---|---|
| POST | `/login` | `{email,password}` → sets cookie |
| POST | `/logout` | clears cookie |
| GET | `/config` | full config object |
| PUT | `/config` | full config → zod-validate → save → revalidate |
| PATCH | `/config/reorder` | `{ path, order[] }` targeted array reorder |
| POST | `/upload/sign` | returns Cloudinary signature/params for a direct browser upload |

All writes validate with zod and return `{ success, data | error }` (consistent envelope per project patterns).

## 6. Site refactor (the delicate part — test-first)

- Introduce `getConfig()` (server) and `<ConfigProvider>` + `useConfig()` (client).
- Replace each `import config from "/CONFIG.json"` (~19 files) with the appropriate accessor. No visual/behavioral change intended — snapshot/existing behavior preserved.
- Keep `CONFIG.json` as seed + fallback; do not delete it.
- Order of work: build data layer + provider first (green tests), then migrate files in small batches, verifying the rendered site after each batch.

## 7. Admin UI (`/admin`) — Tailwind + Radix/shadcn (existing stack)

- `/admin/login` — email/password form, redirects to `/admin` on success.
- `/admin` — left-nav shell; one panel per section. Each panel: load current values → edit → Save (PUT) → toast. Sections:
  1. Site metadata & SEO / embeds
  2. Global theme (colors, font, gradient, background images, custom cursor)
  3. Resume button
  4. Home → profile pic (upload), about/description, **skills** (languages + tools) add/remove/**reorder**, **experience** add/edit/delete/**reorder**, About Me, GitHub stats
  5. Projects → `cards[]` add/edit/delete/**reorder**, per-card image upload, badges
  6. Project detail pages (`pages.custom`) → block editor (text / features / posts / statistics), images, buttons, tags; add/delete pages
  7. Contact → email, **social links** add/edit/delete/reorder + icon picker, legal, contact-form fields; **"Connect With Me"** dropdown
  8. Footer links
  9. Privacy sections
- Reordering: `@dnd-kit/core` + `@dnd-kit/sortable`.
- Feedback: `react-toastify` (already a dependency).
- "View site" link opens the live site (reflects changes after Save via revalidation). Live in-panel preview is out of scope for v1.
- Visual style: cohesive with the portfolio (same tokens), modern/polished.

## 8. Images (Cloudinary)

- `POST /api/admin/upload/sign` signs params server-side (`CLOUDINARY_API_SECRET`); browser uploads directly to Cloudinary; the returned `secure_url` is written into the relevant config field on Save.
- Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

## 9. De-fork + attribution

1. `git bundle` backup of the repo.
2. Recreate `pratxk/pratikfolio` as a standalone (non-fork) repo: push all branches, delete the fork, recreate under the same name, push again.
3. Keep `LICENSE` (AGPL-3.0) and upstream `Copyright (C) 2025 Maxim` headers. Add `Copyright (C) 2026 Pratik Singh` alongside and update the footer credit text.
4. Compliance note: AGPL is network-copyleft — the repo stays **public** (or a source link is shown) so deployed-source availability is satisfied.

## 10. Testing (TDD, 80%+)

- **Unit:** `config-service` (get/update/fallback/reorder), auth (hash/verify, JWT sign/verify), zod schema (valid/invalid configs).
- **Integration:** admin API routes against `mongodb-memory-server` — login (success/fail/rate-limit), config GET/PUT (auth + validation), reorder, upload-sign.
- **Component:** login form, one representative section form (e.g., cards editor) — render, edit, save-call, reorder.
- **E2E (optional, Playwright available):** login → edit a card → save → assert change.
- Test runner: add Vitest + React Testing Library (repo has none today); jsdom env.

## 11. Env vars

`.env.local` (gitignored) and documented in `.env.example`; mirrored in Vercel project settings:
`MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

## 12. Risks & mitigations

- **19-file refactor breaking the live site** → test-first, `CONFIG.json` fallback retained, migrate in small verified batches.
- **Site becomes dynamic (DB read)** → `unstable_cache` + `revalidateTag` keeps it cache-fast; DB hit only on cache miss / after a save.
- **Secrets** → only in `.env.local`/Vercel; never committed or logged; `.env.local` confirmed gitignored.
- **AGPL** → license + attribution retained; repo public.

## 13. Out of scope (v1)

Multi-user/roles, audit history/versioning of config, in-panel live preview iframe, analytics, i18n.
