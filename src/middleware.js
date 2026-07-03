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
    return NextResponse.redirect(
      new URL(configuration.global.home_route || "/home", req.url),
    );
  }

  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const ok = token && (await verifySession(token));
    if (!ok) {
      if (isAdminApi)
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
};
