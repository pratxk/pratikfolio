/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";

// Edits a plain object keyed by string (e.g. pages.custom, statistics) as a
// list of add/rename/delete-able entries. renderEntry(value, update) renders
// the fields for one entry's value.
export default function ObjectEntriesField({
  label,
  value = {},
  onChange,
  renderEntry,
  newEntry,
  addLabel = "Add",
}) {
  const entries = Object.entries(value || {});

  function updateVal(key, val) {
    onChange({ ...value, [key]: val });
  }
  function renameKey(oldKey, newKey) {
    if (!newKey || newKey === oldKey || value[newKey] != null) return;
    const next = {};
    for (const [k, v] of Object.entries(value)) next[k === oldKey ? newKey : k] = v;
    onChange(next);
  }
  function deleteKey(key) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }
  function addEntry() {
    let k = "new_entry";
    let i = 1;
    while (value[k] != null) k = `new_entry_${i++}`;
    onChange({ ...value, [k]: newEntry() });
  }

  return (
    <div className="flex flex-col gap-3">
      {label && <div className="text-sm font-semibold text-white/90">{label}</div>}
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="rounded-md border border-white/15 bg-white/5 p-3"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-white/40">key</span>
            <input
              defaultValue={key}
              onBlur={(e) => renameKey(key, e.target.value.trim())}
              className="flex-1 rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white outline-none focus:border-white/40"
            />
            <button
              type="button"
              onClick={() => deleteKey(key)}
              className="rounded px-2 py-1 text-sm text-red-300 hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
          {renderEntry(val, (nv) => updateVal(key, nv))}
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="self-start rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
      >
        {addLabel}
      </button>
    </div>
  );
}
