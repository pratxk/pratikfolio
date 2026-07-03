/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { redirect } from "next/navigation";
import { SECTIONS } from "@/components/admin/section-descriptors.js";

export default function AdminIndex() {
  redirect(`/admin/${SECTIONS[0].key}`);
}
