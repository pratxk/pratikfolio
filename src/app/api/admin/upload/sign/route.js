/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { signUpload } from "@/lib/cloudinary.js";

export async function POST(req) {
  const { folder = "portfolio" } = await req.json().catch(() => ({}));
  const timestamp = Math.floor(Date.now() / 1000);
  return NextResponse.json({
    success: true,
    data: signUpload({ timestamp, folder }),
  });
}
