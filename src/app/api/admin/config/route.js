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
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 400 },
    );
  }
}
