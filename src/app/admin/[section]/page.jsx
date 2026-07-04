/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell.jsx";
import SectionEditor from "@/components/admin/SectionEditor.jsx";
import { sectionByKey } from "@/components/admin/section-descriptors.js";

export default async function AdminSectionPage({ params }) {
  const { section } = await params;
  // Validate here, but pass only the string key across the RSC boundary —
  // the descriptor contains functions that can't be serialized.
  if (!sectionByKey(section)) notFound();
  return (
    <AdminShell>
      <SectionEditor sectionKey={section} />
    </AdminShell>
  );
}
