/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
export default function ColorField({ label, value, onChange }) {
  const id = `f-${label}`;
  // value may be a hex ("#ce6419") or non-hex token (e.g. HSL string); the
  // color picker only supports hex, so it stays synced with the text input.
  const isHex = /^#[0-9a-fA-F]{6}$/.test(value ?? "");
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          className="h-9 w-12 rounded border border-white/15 bg-transparent"
          value={isHex ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          id={id}
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/40"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
