/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
export default function ToggleField({ label, value, onChange }) {
  const id = `f-${label}`;
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 accent-white"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}
      </label>
    </div>
  );
}
