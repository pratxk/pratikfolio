/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useEffect, useState } from "react";
import { getPath, setPath } from "@/components/admin/path-utils.js";
import { useSave } from "@/components/admin/useSave.js";
import { sectionByKey } from "@/components/admin/section-descriptors.js";
import Control from "@/components/admin/Control.jsx";
import EntityGrid from "@/components/admin/EntityGrid.jsx";
import { CardGridSkeleton } from "@/components/admin/ui/Skeleton.jsx";

const isGrid = (t) => t === "array" || t === "objectEntries";

export default function SectionEditor({ descriptor, sectionKey }) {
  const desc = descriptor || sectionByKey(sectionKey);
  const [config, setConfig] = useState(null);
  const { saving, save } = useSave();

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((j) => alive && setConfig(j.data));
    return () => {
      alive = false;
    };
  }, []);

  if (!config) return <CardGridSkeleton />;

  // Persist a whole-config change immediately (used by card grids).
  const applyAndSave = (next) => {
    setConfig(next);
    save(next);
  };

  const scalarFields = desc.fields.filter((f) => !isGrid(f.type));
  const gridFields = desc.fields.filter((f) => isGrid(f.type));

  return (
    <div className="flex flex-col gap-10">
      {scalarFields.length > 0 && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{desc.label}</h2>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(config)}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-2">
            {scalarFields.map((field) => (
              <div
                key={field.path.join(".")}
                className={field.type === "textarea" ? "lg:col-span-2" : ""}
              >
                <Control
                  field={{ ...field, key: field.path.join(".") }}
                  value={getPath(config, field.path)}
                  onChange={(v) => setConfig((c) => setPath(c, field.path, v))}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {gridFields.map((field) => (
        <section key={field.path.join(".")}>
          <EntityGrid
            title={field.label}
            value={getPath(config, field.path)}
            fields={field.itemFields}
            preview={field.preview}
            keyed={field.type === "objectEntries"}
            newSpec={field.type === "objectEntries" ? field.newEntry : field.newItem}
            addLabel={field.addLabel || "Add"}
            saving={saving}
            onChange={(newVal) => applyAndSave(setPath(config, field.path, newVal))}
          />
        </section>
      ))}
    </div>
  );
}
