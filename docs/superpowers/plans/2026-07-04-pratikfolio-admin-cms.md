# Pratikfolio Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure email/password admin dashboard at `/admin` that edits every part of the portfolio (stored in MongoDB), with Cloudinary image uploads, drag-reorder, and live updates on the deployed site with no redeploy.

**Architecture:** Config source-of-truth moves from the statically-imported `CONFIG.json` into a MongoDB `config` singleton. The public site reads it via a cached `getConfig()` (server) + a `<ConfigProvider>` React context (client), with `revalidateTag("config")` firing on every admin save so pages stay cache-fast yet current. Admin auth is a bcrypt-checked login issuing a signed HttpOnly JWT cookie; `/admin/*` and `/api/admin/*` are gated by middleware. `CONFIG.json` remains in the repo as seed + fallback.

**Tech Stack:** Next.js 15 (App Router), npm, MongoDB (`mongodb` driver), `bcryptjs`, `jose` (JWT), `zod` (validation), `cloudinary`, `@dnd-kit/*` (reorder), Vitest + React Testing Library + `mongodb-memory-server` (tests).

## Global Constraints

- **Package manager: npm** (bun is NOT installed). Convert `bun run …` scripts to plain commands.
- **AGPL-3.0:** keep `LICENSE` and every existing `Copyright (C) 2025 Maxim` header. New source files get an AGPL header adding `Copyright (C) 2026 Pratik Singh`.
- **Secrets:** only from `process.env`, sourced from `.env.local` (already gitignored). Never hardcode, commit, or log secret values.
- **Mongo database name:** always `client.db(process.env.MONGODB_DB)` (= `pratikfolio`), never the connection string's default (`Pharm_Easy`).
- **Path alias:** `@/*` → `src/*` (from `jsconfig.json`). Root import `/CONFIG.json` resolves to the repo-root file.
- **No behavior change to the public site** during the refactor — same rendered output, `CONFIG.json` retained as fallback.
- **TDD, frequent commits, 80%+ coverage.** Commit messages: conventional commits, no co-author trailer.
- **API response envelope:** `{ success: boolean, data?: T, error?: string }`.

---

## File Structure

**New — data & lib**
- `src/lib/db.js` — Mongo client singleton.
- `src/lib/config-schema.js` — zod schema for the full config.
- `src/lib/config-service.js` — `getConfig()`, `updateConfig()`, `reorderInConfig()`.
- `src/lib/auth.js` — password hash/verify, JWT sign/verify, cookie helpers.
- `src/lib/cloudinary.js` — signature generation for direct uploads.
- `src/context/config-context.jsx` — `<ConfigProvider>` + `useConfig()`.

**New — API routes**
- `src/app/api/admin/login/route.js`
- `src/app/api/admin/logout/route.js`
- `src/app/api/admin/config/route.js` (GET, PUT)
- `src/app/api/admin/config/reorder/route.js` (PATCH)
- `src/app/api/admin/upload/sign/route.js` (POST)

**New — admin UI**
- `src/app/admin/login/page.jsx`
- `src/app/admin/layout.jsx` (nav shell + auth guard)
- `src/app/admin/page.jsx` (redirects to first section)
- `src/app/admin/[section]/page.jsx` (renders a section editor from a descriptor)
- `src/components/admin/fields/*` — `TextField`, `TextareaField`, `ColorField`, `ToggleField`, `ImageField`, `ArrayField` (dnd-kit sortable).
- `src/components/admin/SectionEditor.jsx` — descriptor-driven form.
- `src/components/admin/section-descriptors.js` — the 9 section field maps.
- `src/components/admin/useSave.js` — save hook (PUT + toast + optimistic state).

**New — scripts & config**
- `scripts/seed.js` — seed config singleton + admin from env.
- `vitest.config.js`, `test/setup.js`.

**Modified**
- `package.json` — deps + npm scripts + test scripts.
- `src/middleware.js` — add `/admin` + `/api/admin` auth gating (keep `/`→home).
- `src/app/layout.js` — async, `getConfig()`, wrap in `<ConfigProvider>`.
- ~18 site files doing `import config from "/CONFIG.json"` → `useConfig()`/`getConfig()`.
- Footer credit + new-file headers (attribution).

---

## Phase 0 — Tooling, deps, test harness

### Task 0.1: Dependencies and npm-native scripts

**Files:** Modify `package.json`

- [ ] **Step 1: Install runtime + dev deps**

Run:
```bash
cd ~/Documents/GenAI/pratikfolio
npm install mongodb bcryptjs jose zod cloudinary @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom mongodb-memory-server
```
Expected: installs succeed; `package.json` gains the dependencies.

- [ ] **Step 2: Make scripts npm-native and add test scripts**

In `package.json` `"scripts"`, replace bun-prefixed commands and add tests:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "add-headers": "node scripts/add-headers.js",
    "prepare": "husky",
    "seed": "node scripts/seed.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 3: Verify dev server still boots**

Run: `npm run dev` (wait for "Ready", then Ctrl-C)
Expected: compiles, no missing-module errors. The unmodified site still uses `CONFIG.json`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add CMS deps, switch scripts to npm, add test scripts"
```

### Task 0.2: Vitest configuration

**Files:** Create `vitest.config.js`, `test/setup.js`

- [ ] **Step 1: Write vitest config**

`vitest.config.js`:
```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
    testTimeout: 20000, // mongodb-memory-server first-run download
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "/CONFIG.json": path.resolve(__dirname, "./CONFIG.json"),
    },
  },
});
```

`test/setup.js`:
```js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Add a smoke test**

`test/smoke.test.js`:
```js
import { describe, it, expect } from "vitest";
describe("harness", () => {
  it("runs", () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 3: Run it**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.js test/setup.js test/smoke.test.js
git commit -m "test: add vitest + RTL harness"
```

---

## Phase 1 — Data layer

### Task 1.1: Mongo client singleton

**Files:** Create `src/lib/db.js`; Test `test/lib/db.test.js`

**Interfaces:**
- Produces: `getDb(): Promise<Db>` — returns the `pratikfolio` database, reusing one client across calls/HMR.

- [ ] **Step 1: Write the failing test**

`test/lib/db.test.js`:
```js
import { describe, it, expect, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mem;
describe("getDb", () => {
  afterAll(async () => { if (mem) await mem.stop(); });
  it("returns a Db bound to MONGODB_DB and reuses the client", async () => {
    mem = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mem.getUri();
    process.env.MONGODB_DB = "pratikfolio_test";
    const { getDb, _resetForTest } = await import("@/lib/db.js");
    _resetForTest?.();
    const db1 = await getDb();
    const db2 = await getDb();
    expect(db1.databaseName).toBe("pratikfolio_test");
    expect(db1).toBe(db2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- db.test`
Expected: FAIL (cannot resolve `@/lib/db.js`).

- [ ] **Step 3: Implement**

`src/lib/db.js`:
```js
/**
 * Portfolio Admin CMS
 * Copyright (C) 2026 Pratik Singh
 * Based on Portfolio, Copyright (C) 2025 Maxim (AGPL-3.0).
 */
import { MongoClient } from "mongodb";

let cached = globalThis.__mongo;
if (!cached) cached = globalThis.__mongo = { client: null, promise: null };

export function _resetForTest() { cached.client = null; cached.promise = null; }

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!cached.client) {
    if (!cached.promise) cached.promise = new MongoClient(uri).connect();
    cached.client = await cached.promise;
  }
  return cached.client.db(process.env.MONGODB_DB || "pratikfolio");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- db.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.js test/lib/db.test.js
git commit -m "feat: add mongo client singleton (getDb)"
```

### Task 1.2: Config zod schema

**Files:** Create `src/lib/config-schema.js`; Test `test/lib/config-schema.test.js`

**Interfaces:**
- Produces: `configSchema` (zod object). Permissive but structural: known top-level keys with the right *types*; unknown nested keys pass through (`.passthrough()` on nested objects) so future config additions don't break validation. Top-level required keys: `siteMetadata`, `global`, `resume_button`, `footer`, `pages`, `card`, `cards`.

- [ ] **Step 1: Write the failing test**

`test/lib/config-schema.test.js`:
```js
import { describe, it, expect } from "vitest";
import { configSchema } from "@/lib/config-schema.js";
import realConfig from "/CONFIG.json";

describe("configSchema", () => {
  it("accepts the current CONFIG.json", () => {
    expect(() => configSchema.parse(realConfig)).not.toThrow();
  });
  it("rejects a config missing cards", () => {
    const bad = { ...realConfig }; delete bad.cards;
    expect(() => configSchema.parse(bad)).toThrow();
  });
  it("rejects cards that is not an array", () => {
    expect(() => configSchema.parse({ ...realConfig, cards: {} })).toThrow();
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (`Cannot find module config-schema`).

- [ ] **Step 3: Implement**

`src/lib/config-schema.js`:
```js
/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import { z } from "zod";

const obj = z.object({}).passthrough();
export const configSchema = z.object({
  siteMetadata: obj,
  global: obj,
  resume_button: obj,
  footer: obj,
  pages: obj,
  card: obj,
  cards: z.array(obj),
}).passthrough();
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/config-schema.js test/lib/config-schema.test.js
git commit -m "feat: add zod config schema"
```

### Task 1.3: Config service (get/update/reorder + fallback + cache)

**Files:** Create `src/lib/config-service.js`; Test `test/lib/config-service.test.js`

**Interfaces:**
- Consumes: `getDb` (1.1), `configSchema` (1.2).
- Produces:
  - `readConfig(): Promise<object>` — uncached DB read; returns the singleton's `data`, or the bundled `CONFIG.json` if `MONGODB_URI` unset or singleton missing.
  - `getConfig(): Promise<object>` — cached wrapper (`unstable_cache`, tag `"config"`).
  - `updateConfig(nextData): Promise<object>` — validates via `configSchema`, upserts singleton, `revalidateTag("config")`, returns saved data.
  - `reorderInConfig(pathArray, orderIndexes): Promise<object>` — reorders the array at `pathArray` (e.g. `["cards"]`, `["pages","home","experience","list"]`) per `orderIndexes`, then `updateConfig`.
  - `SINGLETON_ID = "singleton"`.

Note: `unstable_cache`/`revalidateTag` from `next/cache` are not exercised in unit tests (tested via API/integration). Unit tests target `readConfig`, `updateConfig` (mock `next/cache`), and `reorderInConfig`.

- [ ] **Step 1: Write the failing test**

`test/lib/config-service.test.js`:
```js
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

vi.mock("next/cache", () => ({
  unstable_cache: (fn) => fn,
  revalidateTag: vi.fn(),
}));

let mem;
beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.MONGODB_DB = "pratikfolio_test";
  const { _resetForTest } = await import("@/lib/db.js");
  _resetForTest();
});
afterAll(async () => { if (mem) await mem.stop(); });

describe("config-service", () => {
  it("falls back to CONFIG.json when singleton absent", async () => {
    const { readConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    expect(cfg.cards).toBeInstanceOf(Array);
  });
  it("updateConfig persists and readConfig returns it", async () => {
    const { readConfig, updateConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    const next = { ...cfg, siteMetadata: { ...cfg.siteMetadata, title: "New Title" } };
    await updateConfig(next);
    const back = await readConfig();
    expect(back.siteMetadata.title).toBe("New Title");
  });
  it("updateConfig rejects invalid config", async () => {
    const { updateConfig } = await import("@/lib/config-service.js");
    await expect(updateConfig({ nope: true })).rejects.toThrow();
  });
  it("reorderInConfig reorders a nested array", async () => {
    const { readConfig, updateConfig, reorderInConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    const two = [{ title: "A" }, { title: "B" }];
    await updateConfig({ ...cfg, cards: two });
    await reorderInConfig(["cards"], [1, 0]);
    const back = await readConfig();
    expect(back.cards.map((c) => c.title)).toEqual(["B", "A"]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`src/lib/config-service.js`:
```js
/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import { unstable_cache, revalidateTag } from "next/cache";
import fallbackConfig from "/CONFIG.json";
import { getDb } from "@/lib/db.js";
import { configSchema } from "@/lib/config-schema.js";

export const SINGLETON_ID = "singleton";
const COLLECTION = "config";

export async function readConfig() {
  if (!process.env.MONGODB_URI) return fallbackConfig;
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: SINGLETON_ID });
    return doc?.data ?? fallbackConfig;
  } catch {
    return fallbackConfig;
  }
}

export const getConfig = unstable_cache(readConfig, ["portfolio-config"], {
  tags: ["config"],
});

export async function updateConfig(nextData) {
  const data = configSchema.parse(nextData);
  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { _id: SINGLETON_ID },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true },
  );
  revalidateTag("config");
  return data;
}

function getAtPath(root, pathArray) {
  return pathArray.reduce((acc, k) => (acc == null ? acc : acc[k]), root);
}

export async function reorderInConfig(pathArray, orderIndexes) {
  const cfg = await readConfig();
  const clone = structuredClone(cfg);
  const arr = getAtPath(clone, pathArray);
  if (!Array.isArray(arr)) throw new Error("path is not an array");
  const reordered = orderIndexes.map((i) => arr[i]);
  const parent = getAtPath(clone, pathArray.slice(0, -1));
  parent[pathArray[pathArray.length - 1]] = reordered;
  return updateConfig(clone);
}
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/config-service.js test/lib/config-service.test.js
git commit -m "feat: add config service (read/update/reorder with fallback)"
```

### Task 1.4: Seed script

**Files:** Create `scripts/seed.js`

**Interfaces:** Consumes env (`MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`). Upserts `config.singleton` from `CONFIG.json` and one admin.

- [ ] **Step 1: Implement**

`scripts/seed.js`:
```js
/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 * Usage: node scripts/seed.js   (loads .env.local)
 */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// minimal .env.local loader
for (const line of fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

(async () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../CONFIG.json"), "utf8"));
  const client = await new MongoClient(process.env.MONGODB_URI).connect();
  const db = client.db(process.env.MONGODB_DB || "pratikfolio");

  await db.collection("config").updateOne(
    { _id: "singleton" },
    { $set: { data: config, updatedAt: new Date() } },
    { upsert: true },
  );
  console.log("✓ config singleton seeded");

  const email = process.env.ADMIN_EMAIL, pw = process.env.ADMIN_PASSWORD;
  if (!email || !pw || email.includes("CHANGE_ME") || pw.includes("CHANGE_ME")) {
    console.log("! ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed");
  } else {
    const passwordHash = await bcrypt.hash(pw, 12);
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("admins").updateOne(
      { email }, { $set: { email, passwordHash }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    console.log(`✓ admin ${email} seeded`);
  }
  await client.close();
})().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run (after ADMIN_* set in .env.local)**

Run: `npm run seed`
Expected: "✓ config singleton seeded" and "✓ admin … seeded".

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.js
git commit -m "feat: add seed script (config singleton + admin)"
```

---

## Phase 2 — Auth

### Task 2.1: Auth lib (hash, JWT, cookie)

**Files:** Create `src/lib/auth.js`; Test `test/lib/auth.test.js`

**Interfaces:**
- Produces:
  - `hashPassword(pw): Promise<string>`, `verifyPassword(pw, hash): Promise<boolean>`
  - `signSession(payload): Promise<string>` (jose HS256, 7d, `AUTH_SECRET`)
  - `verifySession(token): Promise<object|null>`
  - `SESSION_COOKIE = "admin_session"`

- [ ] **Step 1: Failing test**

`test/lib/auth.test.js`:
```js
import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => { process.env.AUTH_SECRET = "test-secret-value-123456789"; });

describe("auth", () => {
  it("hashes and verifies passwords", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth.js");
    const h = await hashPassword("s3cret");
    expect(await verifyPassword("s3cret", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("signs and verifies a session, rejects tampered tokens", async () => {
    const { signSession, verifySession } = await import("@/lib/auth.js");
    const t = await signSession({ email: "a@b.c" });
    expect((await verifySession(t)).email).toBe("a@b.c");
    expect(await verifySession(t + "x")).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`src/lib/auth.js`:
```js
/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export function hashPassword(pw) { return bcrypt.hash(pw, 12); }
export function verifyPassword(pw, hash) { return bcrypt.compare(pw, hash); }

export function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token) {
  try { return (await jwtVerify(token, secret())).payload; }
  catch { return null; }
}
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.js test/lib/auth.test.js
git commit -m "feat: add auth lib (bcrypt + jose session)"
```

### Task 2.2: Login/logout API + rate limit

**Files:** Create `src/app/api/admin/login/route.js`, `src/app/api/admin/logout/route.js`, `src/lib/rate-limit.js`; Test `test/lib/rate-limit.test.js`, `test/api/login.test.js`

**Interfaces:**
- `src/lib/rate-limit.js` produces `rateLimit(key, max, windowMs): boolean` (true = allowed) — in-memory sliding window on `globalThis`.
- `POST /api/admin/login` `{email,password}` → 200 + Set-Cookie on success; 401 on bad creds; 429 when limited.

- [ ] **Step 1: Failing test — rate limiter**

`test/lib/rate-limit.test.js`:
```js
import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit.js";
describe("rateLimit", () => {
  it("allows up to max then blocks in-window", () => {
    const k = "k-" + Math.random();
    expect(rateLimit(k, 2, 10000)).toBe(true);
    expect(rateLimit(k, 2, 10000)).toBe(true);
    expect(rateLimit(k, 2, 10000)).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement rate limiter**

`src/lib/rate-limit.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
const store = globalThis.__rl || (globalThis.__rl = new Map());
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hits = (store.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) { store.set(key, hits); return false; }
  hits.push(now); store.set(key, hits); return true;
}
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Implement login/logout routes**

`src/app/api/admin/login/route.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db.js";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth.js";
import { rateLimit } from "@/lib/rate-limit.js";

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`login:${ip}`, 5, 60000))
    return NextResponse.json({ success: false, error: "Too many attempts" }, { status: 429 });

  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password)
    return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 400 });

  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email });
  if (!admin || !(await verifyPassword(password, admin.passwordHash)))
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });

  const token = await signSession({ email });
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
```

`src/app/api/admin/logout/route.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth.js";
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 6: Integration test for login**

`test/api/login.test.js`:
```js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mem;
beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.MONGODB_DB = "pratikfolio_test";
  process.env.AUTH_SECRET = "test-secret-value-123456789";
  const { _resetForTest } = await import("@/lib/db.js");
  _resetForTest();
  const { getDb } = await import("@/lib/db.js");
  const { hashPassword } = await import("@/lib/auth.js");
  const db = await getDb();
  await db.collection("admins").insertOne({ email: "me@x.io", passwordHash: await hashPassword("pw123456") });
});
afterAll(async () => { if (mem) await mem.stop(); });

function reqOf(body) { return new Request("http://x/api/admin/login", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }); }

describe("POST /api/admin/login", () => {
  it("rejects bad password", async () => {
    const { POST } = await import("@/app/api/admin/login/route.js");
    const res = await POST(reqOf({ email: "me@x.io", password: "nope" }));
    expect(res.status).toBe(401);
  });
  it("accepts good creds and sets cookie", async () => {
    const { POST } = await import("@/app/api/admin/login/route.js");
    const res = await POST(reqOf({ email: "me@x.io", password: "pw123456" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("admin_session=");
  });
});
```

- [ ] **Step 7: Run — expect PASS.**

Run: `npm test -- login rate-limit`

- [ ] **Step 8: Commit**

```bash
git add src/lib/rate-limit.js src/app/api/admin/login src/app/api/admin/logout test/lib/rate-limit.test.js test/api/login.test.js
git commit -m "feat: add admin login/logout API with rate limiting"
```

### Task 2.3: Middleware auth gate

**Files:** Modify `src/middleware.js`; Test `test/middleware.test.js`

**Interfaces:** Consumes `verifySession`, `SESSION_COOKIE`. Redirect unauthenticated `/admin/*` (except `/admin/login`) to `/admin/login`; return 401 for unauthenticated `/api/admin/*` (except `/api/admin/login`). Preserve `/`→`home_route`.

- [ ] **Step 1: Failing test**

`test/middleware.test.js`:
```js
import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
beforeAll(() => { process.env.AUTH_SECRET = "test-secret-value-123456789"; });

describe("middleware", () => {
  it("redirects unauthenticated /admin to /admin/login", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });
  it("allows /admin/login through", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/admin/login"));
    expect(res.headers.get("location")).toBeNull();
  });
  it("401s unauthenticated /api/admin/config", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/api/admin/config"));
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`src/middleware.js` (replace file; keep AGPL Maxim header at top):
```js
/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * Modifications Copyright (C) 2026 Pratik Singh — AGPL-3.0.
 */
import { NextResponse } from "next/server";
import configuration from "/CONFIG.json";
import { verifySession, SESSION_COOKIE } from "@/lib/auth.js";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(configuration.global.home_route || "/home", req.url));
  }

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const ok = token && (await verifySession(token));
    if (!ok) {
      if (isAdminApi)
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/admin/:path*", "/api/admin/:path*"] };
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/middleware.js test/middleware.test.js
git commit -m "feat: gate /admin and /api/admin behind session in middleware"
```

---

## Phase 3 — Config API (read/write for the dashboard)

### Task 3.1: Config GET/PUT + reorder PATCH + upload sign

**Files:** Create `src/app/api/admin/config/route.js`, `src/app/api/admin/config/reorder/route.js`, `src/lib/cloudinary.js`, `src/app/api/admin/upload/sign/route.js`; Test `test/api/config.test.js`, `test/lib/cloudinary.test.js`

**Interfaces:**
- `GET /api/admin/config` → `{success, data}` current config.
- `PUT /api/admin/config` body = full config → validate + `updateConfig` → `{success, data}` (400 on invalid).
- `PATCH /api/admin/config/reorder` `{path: string[], order: number[]}` → `reorderInConfig` → `{success, data}`.
- `src/lib/cloudinary.js` produces `signUpload(paramsToSign): {signature, timestamp, apiKey, cloudName}`.
- `POST /api/admin/upload/sign` `{folder?}` → signed params for a direct browser upload.

(Auth is enforced by middleware; route handlers assume an authenticated caller.)

- [ ] **Step 1: Failing test — cloudinary signing**

`test/lib/cloudinary.test.js`:
```js
import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => {
  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "123";
  process.env.CLOUDINARY_API_SECRET = "secret";
});
describe("signUpload", () => {
  it("returns deterministic signature params", async () => {
    const { signUpload } = await import("@/lib/cloudinary.js");
    const a = signUpload({ timestamp: 1000, folder: "portfolio" });
    const b = signUpload({ timestamp: 1000, folder: "portfolio" });
    expect(a.signature).toBe(b.signature);
    expect(a.apiKey).toBe("123");
    expect(a.cloudName).toBe("demo");
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement cloudinary + routes**

`src/lib/cloudinary.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { v2 as cloudinary } from "cloudinary";
export function signUpload(paramsToSign) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign, process.env.CLOUDINARY_API_SECRET,
  );
  return {
    signature,
    timestamp: paramsToSign.timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
```

`src/app/api/admin/config/route.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { readConfig, updateConfig } from "@/lib/config-service.js";

export async function GET() {
  return NextResponse.json({ success: true, data: await readConfig() });
}
export async function PUT(req) {
  try {
    const body = await req.json();
    const data = await updateConfig(body);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
```

`src/app/api/admin/config/reorder/route.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { reorderInConfig } from "@/lib/config-service.js";
export async function PATCH(req) {
  try {
    const { path, order } = await req.json();
    const data = await reorderInConfig(path, order);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
```

`src/app/api/admin/upload/sign/route.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { signUpload } from "@/lib/cloudinary.js";
export async function POST(req) {
  const { folder = "portfolio" } = await req.json().catch(() => ({}));
  const timestamp = Math.floor(Date.now() / 1000);
  return NextResponse.json({ success: true, data: signUpload({ timestamp, folder }) });
}
```

- [ ] **Step 4: Integration test — config GET/PUT/reorder**

`test/api/config.test.js`:
```js
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
vi.mock("next/cache", () => ({ unstable_cache: (fn) => fn, revalidateTag: vi.fn() }));

let mem;
beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.MONGODB_DB = "pratikfolio_test";
  const { _resetForTest } = await import("@/lib/db.js"); _resetForTest();
});
afterAll(async () => { if (mem) await mem.stop(); });

describe("config API", () => {
  it("GET returns config, PUT saves, reorder works", async () => {
    const { GET, PUT } = await import("@/app/api/admin/config/route.js");
    const { PATCH } = await import("@/app/api/admin/config/reorder/route.js");
    const initial = (await (await GET()).json()).data;
    const next = { ...initial, cards: [{ title: "A" }, { title: "B" }] };
    const putRes = await PUT(new Request("http://x", { method: "PUT", body: JSON.stringify(next) }));
    expect(putRes.status).toBe(200);
    const patchRes = await PATCH(new Request("http://x", { method: "PATCH", body: JSON.stringify({ path: ["cards"], order: [1, 0] }) }));
    const data = (await patchRes.json()).data;
    expect(data.cards.map((c) => c.title)).toEqual(["B", "A"]);
  });
  it("PUT rejects invalid config", async () => {
    const { PUT } = await import("@/app/api/admin/config/route.js");
    const res = await PUT(new Request("http://x", { method: "PUT", body: JSON.stringify({ bad: 1 }) }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 5: Run — expect PASS.**

Run: `npm test -- config cloudinary`

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/config src/app/api/admin/upload src/lib/cloudinary.js test/api/config.test.js test/lib/cloudinary.test.js
git commit -m "feat: add config GET/PUT/reorder + cloudinary upload signing API"
```

---

## Phase 4 — Public site refactor (DB-backed config, no behavior change)

### Task 4.1: Config context + provider

**Files:** Create `src/context/config-context.jsx`; Test `test/context/config-context.test.jsx`

**Interfaces:** Produces `<ConfigProvider value={config}>` and `useConfig()` returning the config object (throws if used outside provider).

- [ ] **Step 1: Failing test**

`test/context/config-context.test.jsx`:
```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfigProvider, useConfig } from "@/context/config-context.jsx";

function Show() { return <p>{useConfig().siteMetadata.title}</p>; }
describe("config context", () => {
  it("provides config to consumers", () => {
    render(<ConfigProvider value={{ siteMetadata: { title: "Hi" } }}><Show /></ConfigProvider>);
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`src/context/config-context.jsx`:
```jsx
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { createContext, useContext } from "react";
const Ctx = createContext(null);
export function ConfigProvider({ value, children }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useConfig() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfig must be used within ConfigProvider");
  return v;
}
```

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/context/config-context.jsx test/context/config-context.test.jsx
git commit -m "feat: add ConfigProvider + useConfig"
```

### Task 4.2: Make layout async + provide config; migrate client components

**Files:** Modify `src/app/layout.js` and every file matching `import config from "/CONFIG.json"` in `src/` **except** `src/middleware.js` (already handled) and `src/lib/config-service.js` (fallback import stays).

**Migration rule:**
- **Server components** (no `"use client"`): `const config = await getConfig();` at top of the async component; remove the static import.
- **Client components** (`"use client"`): replace `import config from "/CONFIG.json";` with `import { useConfig } from "@/context/config-context.jsx";` and add `const config = useConfig();` as the first line inside the component.

- [ ] **Step 1: List every affected file**

Run:
```bash
grep -rln 'from "/CONFIG.json"' src | grep -v 'middleware.js' | grep -v 'config-service.js'
```
Expected list (verify): `src/app/layout.js`, `src/app/home/page.js`, `src/app/[...slug]/page.js`, `src/app/contact/page.js`, `src/app/privacy/page.js`, `src/app/projects/page.js`, `src/components/ui/spotlight-new.jsx`, `src/components/custom/timeline.jsx`, `src/components/custom/AboutMeCard.jsx`, `src/components/custom/action_buttons.jsx`, `src/components/custom/profile_section.jsx`, `src/components/custom/github_stats.jsx`, `src/components/custom/theme_provider.jsx`, `src/components/custom/cursor.jsx`, `src/components/custom/navbar.jsx`, `src/components/custom/background.jsx`, `src/components/custom/tech_scroller.jsx`, `src/lib/parse_links.js`.

- [ ] **Step 2: Rewrite `layout.js`**

Make it async, provide config, and move metadata to `generateMetadata`. Replace the `import config from "/CONFIG.json";` line with `import { getConfig } from "@/lib/config-service.js";` and `import { ConfigProvider } from "@/context/config-context.jsx";`. Replace the static `export const metadata = {…}` with:
```js
export async function generateMetadata() {
  const config = await getConfig();
  return {
    title: config.siteMetadata.title,
    description: config.siteMetadata.description,
    openGraph: {
      title: config.siteMetadata.title,
      description: config.siteMetadata.description,
      images: [{ url: config.siteMetadata.embeds?.image }],
    },
    twitter: {
      card: config.siteMetadata.embeds?.twitter_card || "summary_large_image",
      title: config.siteMetadata.title,
      description: config.siteMetadata.description,
      images: [config.siteMetadata.embeds?.image],
    },
    other: { "theme-color": config.siteMetadata.embeds?.color || "#ce6419" },
  };
}
```
Change the component to `export default async function RootLayout({ children }) { const config = await getConfig(); const selectedFont = fonts[config.global.font] || deliusFont;` and wrap the existing tree in `<ConfigProvider value={config}> … </ConfigProvider>` (place the provider just inside `<body>` so both server-passed props and client `useConfig()` work; `Navbar`, `CustomCursor`, `Background`, `Spotlight`, `ThemeProvider`, `Footer` all become children of the provider). Keep passing `config` to `<Footer config={config} />` (Footer already takes a prop — leave as-is or switch to `useConfig()` per its client/server status).

- [ ] **Step 3: `parse_links.js`** — this is a lib used by client components. It currently imports config at module scope. Change `parseText`/link parsing to **not** read config at import time; if it needs config values, accept them as a parameter from callers. Inspect its usage of `config` and thread the needed value(s) through the function signature. (If it only uses `config` for a base URL or similar, add a param with a default.)

- [ ] **Step 4: Migrate the remaining client components** (`spotlight-new`, `timeline`, `AboutMeCard`, `action_buttons`, `profile_section`, `github_stats`, `theme_provider`, `cursor`, `navbar`, `background`, `tech_scroller`) using the client rule above. Each: swap the import, add `const config = useConfig();` as the first hook line.

- [ ] **Step 5: Migrate server page components** (`home/page.js`, `[...slug]/page.js`, `contact/page.js`, `privacy/page.js`, `projects/page.js`): make each `export default async function`, add `const config = await getConfig();`, remove the static import. If any pass config to client children, pass as props (children still also have context).

- [ ] **Step 6: Run the site and verify visually**

Run: `npm run dev` → open `/home`, `/projects`, `/contact`, `/privacy`, a project page (`/projects/hologramlib`).
Expected: identical to before. (With `MONGODB_URI` set + seeded, it reads DB; without, it falls back to `CONFIG.json`.)

- [ ] **Step 7: Build check**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "refactor: read config from DB via getConfig/useConfig (fallback to CONFIG.json)"
```

---

## Phase 5 — Admin UI framework (descriptor-driven)

### Task 5.1: Save hook + field components

**Files:** Create `src/components/admin/useSave.js`, `src/components/admin/fields/TextField.jsx`, `TextareaField.jsx`, `ColorField.jsx`, `ToggleField.jsx`; Test `test/admin/fields.test.jsx`

**Interfaces:**
- `useSave()` → `{ saving, save(config) }` — PUTs to `/api/admin/config`, toasts success/error.
- Each field: props `{ label, value, onChange }`. `ToggleField` value is boolean; `ColorField` renders `<input type="color">` + text.

- [ ] **Step 1: Failing test (field render + change)**

`test/admin/fields.test.jsx`:
```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextField from "@/components/admin/fields/TextField.jsx";

describe("TextField", () => {
  it("renders label and emits changes", () => {
    const onChange = vi.fn();
    render(<TextField label="Title" value="Hi" onChange={onChange} />);
    const input = screen.getByLabelText("Title");
    expect(input.value).toBe("Hi");
    fireEvent.change(input, { target: { value: "Bye" } });
    expect(onChange).toHaveBeenCalledWith("Bye");
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement fields + save hook**

`src/components/admin/fields/TextField.jsx`:
```jsx
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
export default function TextField({ label, value, onChange }) {
  const id = `f-${label}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} className="rounded border px-3 py-2 bg-transparent"
        value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
```
`TextareaField.jsx`, `ColorField.jsx`, `ToggleField.jsx`: same shape (`textarea`; `input type=color` + text mirror; `input type=checkbox` emitting boolean).

`src/components/admin/useSave.js`:
```js
/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useState } from "react";
import { toast } from "react-toastify";
export function useSave() {
  const [saving, setSaving] = useState(false);
  async function save(config) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      toast.success("Saved — live in a moment");
      return json.data;
    } catch (e) { toast.error(e.message); throw e; }
    finally { setSaving(false); }
  }
  return { saving, save };
}
```

- [ ] **Step 4: Run — expect PASS.** `npm test -- fields`

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/fields src/components/admin/useSave.js test/admin/fields.test.jsx
git commit -m "feat: admin field components + save hook"
```

### Task 5.2: ImageField (Cloudinary) + ArrayField (dnd-kit reorder)

**Files:** Create `src/components/admin/fields/ImageField.jsx`, `src/components/admin/fields/ArrayField.jsx`; Test `test/admin/array-field.test.jsx`

**Interfaces:**
- `ImageField {label, value, onChange}` — shows current image, "Upload" requests a signature from `/api/admin/upload/sign`, uploads the file directly to Cloudinary, calls `onChange(secure_url)`.
- `ArrayField {label, items, render, onChange, onReorder, newItem}` — renders each item via `render(item, i, update)`; drag handles reorder (dnd-kit sortable) calling `onReorder(newOrderIndexes)`; "Add" appends `newItem()`; per-item delete.

- [ ] **Step 1: Failing test (ArrayField add/delete)**

`test/admin/array-field.test.jsx`:
```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ArrayField from "@/components/admin/fields/ArrayField.jsx";

describe("ArrayField", () => {
  it("adds and deletes items", () => {
    const onChange = vi.fn();
    render(<ArrayField label="Cards" items={[{ title: "A" }]}
      newItem={() => ({ title: "" })} onChange={onChange} onReorder={() => {}}
      render={(it) => <span>{it.title}</span>} />);
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith([{ title: "A" }, { title: "" }]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement** `ArrayField` (dnd-kit `DndContext` + `SortableContext`, vertical list, drag handle, Add/Delete buttons) and `ImageField` (fetch sign → POST FormData to `https://api.cloudinary.com/v1_1/<cloudName>/image/upload` with `file`, `api_key`, `timestamp`, `signature`, `folder` → `onChange(json.secure_url)`).

- [ ] **Step 4: Run — expect PASS.** `npm test -- array-field`

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/fields/ImageField.jsx src/components/admin/fields/ArrayField.jsx test/admin/array-field.test.jsx
git commit -m "feat: image upload + drag-reorderable array field"
```

### Task 5.3: SectionEditor + descriptors + admin routing/login UI

**Files:** Create `src/components/admin/SectionEditor.jsx`, `src/components/admin/section-descriptors.js`, `src/app/admin/layout.jsx`, `src/app/admin/page.jsx`, `src/app/admin/[section]/page.jsx`, `src/app/admin/login/page.jsx`; Test `test/admin/section-editor.test.jsx`

**Interfaces:**
- `section-descriptors.js` exports `SECTIONS` = ordered list `{ key, label, fields }`, where each `field` is `{ path: string[], type: "text"|"textarea"|"color"|"toggle"|"image"|"array", label, itemFields? }`. `SectionEditor` reads the current config (GET), renders fields by walking `path`, and Saves the whole config on submit.
- `admin/layout.jsx` — client shell: left-nav from `SECTIONS`, logout button; fetches config once and passes to editors.
- `admin/[section]/page.jsx` — resolves `params.section` → descriptor → `<SectionEditor>`.
- `admin/login/page.jsx` — email/password form → `POST /api/admin/login` → redirect `/admin`.

- [ ] **Step 1: Failing test (SectionEditor renders a text field from a descriptor and saves)**

`test/admin/section-editor.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SectionEditor from "@/components/admin/SectionEditor.jsx";

beforeEach(() => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ json: async () => ({ success: true, data: { siteMetadata: { title: "Hi" } } }) }) // GET
    .mockResolvedValueOnce({ json: async () => ({ success: true, data: {} }) }); // PUT
});

describe("SectionEditor", () => {
  it("loads config and saves an edited value", async () => {
    const descriptor = { key: "meta", label: "Metadata",
      fields: [{ path: ["siteMetadata", "title"], type: "text", label: "Title" }] };
    render(<SectionEditor descriptor={descriptor} />);
    const input = await screen.findByLabelText("Title");
    expect(input.value).toBe("Hi");
    fireEvent.change(input, { target: { value: "Yo" } });
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/admin/config", expect.objectContaining({ method: "PUT" })));
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement** `SectionEditor` (GET `/api/admin/config` on mount into local state; render each descriptor field by reading/writing `path` immutably; on Save call `useSave().save(config)`), the login page, admin layout (nav + `<ToastContainer/>`), and `[section]` route. Build with existing Tailwind classes for a clean dark UI.

- [ ] **Step 4: Run — expect PASS.** `npm test -- section-editor`

- [ ] **Step 5: Manual smoke**

Run: `npm run dev` → visit `/admin` (redirects to `/admin/login`) → log in with seeded creds → land on `/admin/site-metadata`.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin src/app/admin test/admin/section-editor.test.jsx
git commit -m "feat: descriptor-driven SectionEditor + admin shell + login UI"
```

---

## Phase 6 — Section descriptors (all editable content)

### Task 6.1: Fill in every section descriptor

**Files:** Modify `src/components/admin/section-descriptors.js`

Add one entry per section, wiring paths to the real `CONFIG.json` structure. Use `array` fields (with `itemFields`) for lists so add/edit/delete/reorder work. Concrete descriptor set:

1. **site-metadata** — `["siteMetadata","title"]` text, `["siteMetadata","description"]` textarea, `["siteMetadata","embeds","color"]` color, `["siteMetadata","embeds","image"]` image.
2. **theme** — `["global","font"]` text, `["global","gradient"]` text, `["global","background_image"]` image, `["global","background_image_secondary"]` image, each `["global","colors","color-1..5"]` color, `["global","custom_cursor","enabled"]` toggle (+ sparkles/transitions toggles).
3. **resume** — `["resume_button","enabled"]` toggle, `["resume_button","label"]` text, `["resume_button","route"]` text, `["resume_button","file"]` text.
4. **home** — `["pages","home","profile_image"]` image, `["pages","home","about_me"]` text, `["pages","home","description"]` textarea, `["pages","home","languages"]` array of strings, `["pages","home","tools"]` array of strings, `["pages","home","experience","list"]` array with itemFields `{title,company,date,description(textarea),side}`, `["pages","home","aboutMe","content"]` textarea, `["pages","home","github_stats","username"]` text + enabled toggle.
5. **projects** — `["cards"]` array with itemFields `{title, description(textarea), imageSRC(image), buttonText, buttonURL, badges(array of strings)}`.
6. **project-pages** — `["pages","custom"]` — editor for the keyed project pages (title, route, description, images array, tags array, content blocks array with per-type fields, statistics, buttons). (Largest; may be split into its own task if needed.)
7. **contact** — `["pages","contact","email"]` text, `["pages","contact","social_links"]` array `{name,url,icon}`, `["pages","contact","legal",*]` fields, `["pages","contact","contact_form","fields"]` array.
8. **connect** — `["pages","Connect With Me","items"]` array `{name,route}`.
9. **footer** — `["footer","text"]` text, `["footer","links"]` array `{label,url}`.
10. **privacy** — `["pages","privacy","enabled"]` toggle, `["pages","privacy","content","sections"]` array `{title,description,details(array of strings)}`.

- [ ] **Step 1: Add descriptors 1–5 and 7–10** (all except project-pages), each verified in the running admin (`npm run dev`, edit + Save, confirm the public page reflects it after revalidation).
- [ ] **Step 2: Add descriptor 6 (project-pages)** with the content-block sub-editor (block `type` ∈ text/features/posts/statistics).
- [ ] **Step 3: Commit after each descriptor group**

```bash
git add src/components/admin/section-descriptors.js
git commit -m "feat: section descriptor(s) for <group>"
```

---

## Phase 7 — De-fork, attribution, deploy

### Task 7.1: Footer credit + attribution sweep

**Files:** Modify footer text in config/seed, ensure new files carry AGPL header, keep `LICENSE`.

- [ ] **Step 1:** Verify `LICENSE` and all Maxim headers are intact; confirm every new `src/**` file added in this plan has the AGPL header with `Copyright (C) 2026 Pratik Singh`.
- [ ] **Step 2:** Update footer text (via admin or seed) to include a small credit, e.g. `Built on the open-source Portfolio template (AGPL-3.0).`
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: attribution + footer credit"
```

### Task 7.2: Detach the fork (recreate as standalone)

- [ ] **Step 1:** Backup: `git bundle create ~/gh-migration-backups/pratikfolio.bundle --all`.
- [ ] **Step 2:** Push current work to the existing fork remote (so nothing is lost).
- [ ] **Step 3:** Delete + recreate as standalone: `gh repo delete pratxk/pratikfolio --yes` then `gh repo create pratikfolio --public --source=. --remote=origin --push`. Verify `gh repo view pratxk/pratikfolio --json isFork` → `{"isFork": false}`.
- [ ] **Step 4:** Push all branches: `git push origin --all`.

### Task 7.3: Deploy config

- [ ] **Step 1:** Add all env vars (`MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `CLOUDINARY_*`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) to the Vercel project (Production + Preview).
- [ ] **Step 2:** Seed the production DB once: `npm run seed` against prod `MONGODB_URI` (already the same Atlas cluster; DB `pratikfolio`).
- [ ] **Step 3:** Deploy; verify `/home` renders from DB and `/admin` login works; edit a card → confirm the live site updates within seconds (revalidateTag).
- [ ] **Step 4: Commit `.env.example`**

```bash
git add .env.example .gitignore
git commit -m "chore: document env vars"
```

---

## Self-Review

**Spec coverage:** §3 data layer → Phase 1; §4 auth → Phase 2; §5 admin API → Phase 3; §6 site refactor → Phase 4; §7 admin UI → Phases 5–6; §8 Cloudinary → Tasks 3.1/5.2; §9 de-fork → Phase 7; §10 testing → tests throughout; §11 env → `.env.local`/`.env.example`/Task 7.3. All covered.

**Type consistency:** `getConfig`/`readConfig`/`updateConfig`/`reorderInConfig`, `SESSION_COOKIE`, `signSession`/`verifySession`, `signUpload`, `useConfig`/`ConfigProvider`, `useSave().save`, descriptor `{key,label,fields:[{path,type,label,itemFields}]}` — names consistent across tasks.

**Placeholders:** Phase 6 descriptor 6 and the field components’ non-primary variants are specified by shape + concrete paths, not left as "TODO". Each has an independently testable deliverable.

## Notes / Risks

- **First `mongodb-memory-server` run** downloads a binary (hence 20s test timeout).
- **`parse_links.js`** touches config at module scope — Task 4.2 Step 3 must thread config through instead, or the client bundle will still pull `CONFIG.json`. Inspect before editing.
- **Project-pages editor (6.2)** is the richest; if it balloons, split into its own plan.
