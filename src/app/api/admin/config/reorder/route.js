/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { NextResponse } from "next/server";
import { reorderInConfig } from "@/lib/config-service.js";

export async function PATCH(req) {
  try {
    const { path, order } = await req.json();
    const data = await reorderInConfig(path, order);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 400 },
    );
  }
}
