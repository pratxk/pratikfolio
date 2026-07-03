/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell.jsx";
import SectionEditor from "@/components/admin/SectionEditor.jsx";
import { sectionByKey } from "@/components/admin/section-descriptors.js";

export default async function AdminSectionPage({ params }) {
  const { section } = await params;
  const descriptor = sectionByKey(section);
  if (!descriptor) notFound();
  return (
    <AdminShell>
      <SectionEditor descriptor={descriptor} />
    </AdminShell>
  );
}
