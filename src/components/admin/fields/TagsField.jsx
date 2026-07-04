/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useState } from "react";

export default function TagsField({ label, value = [], onChange }) {
  const items = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  }
  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-white/15 bg-white/5 p-2">
        {items.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-cyan-300/70 hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add + Enter"
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>
    </div>
  );
}
