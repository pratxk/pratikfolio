/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useState, useEffect } from "react";

export default function JsonField({ label, value, onChange }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  function handle(e) {
    const next = e.target.value;
    setText(next);
    try {
      const parsed = JSON.parse(next);
      setError("");
      onChange(parsed);
    } catch {
      setError("Invalid JSON — fix to save changes");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <textarea
        rows={18}
        spellCheck={false}
        className="rounded-md border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none focus:border-white/40"
        value={text}
        onChange={handle}
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
