/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import Control from "@/components/admin/Control.jsx";

// Renders the editable fields for a single item (used inside the edit modal).
export default function ItemForm({ fields, value, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map((f) => (
        <Control
          key={f.key}
          field={f}
          value={value?.[f.key]}
          onChange={(v) => onChange({ ...value, [f.key]: v })}
        />
      ))}
    </div>
  );
}
