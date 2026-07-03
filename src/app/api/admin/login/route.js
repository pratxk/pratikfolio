/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db.js";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth.js";
import { rateLimit } from "@/lib/rate-limit.js";

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`login:${ip}`, 5, 60000))
    return NextResponse.json(
      { success: false, error: "Too many attempts" },
      { status: 429 },
    );

  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password)
    return NextResponse.json(
      { success: false, error: "Missing credentials" },
      { status: 400 },
    );

  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email });
  if (!admin || !(await verifyPassword(password, admin.passwordHash)))
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );

  const token = await signSession({ email });
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
