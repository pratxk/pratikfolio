/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useEffect, useState } from "react";
import { getPath, setPath } from "@/components/admin/path-utils.js";
import { useSave } from "@/components/admin/useSave.js";
import TextField from "@/components/admin/fields/TextField.jsx";
import TextareaField from "@/components/admin/fields/TextareaField.jsx";
import ColorField from "@/components/admin/fields/ColorField.jsx";
import ToggleField from "@/components/admin/fields/ToggleField.jsx";
import ImageField from "@/components/admin/fields/ImageField.jsx";
import ArrayField from "@/components/admin/fields/ArrayField.jsx";
import ObjectEntriesField from "@/components/admin/fields/ObjectEntriesField.jsx";
import JsonField from "@/components/admin/fields/JsonField.jsx";
import { sectionByKey } from "@/components/admin/section-descriptors.js";

// Build a fresh item from a descriptor's newItem/newEntry, which may be a
// factory function or a plain template object.
function makeNew(spec) {
  if (typeof spec === "function") return spec();
  return structuredClone(spec ?? {});
}

const SCALARS = {
  text: TextField,
  textarea: TextareaField,
  color: ColorField,
  toggle: ToggleField,
  image: ImageField,
  json: JsonField,
};

// Renders one control for a field spec against a value.
function Control({ field, value, onChange }) {
  if (SCALARS[field.type]) {
    const C = SCALARS[field.type];
    return <C label={field.label} value={value} onChange={onChange} />;
  }
  if (field.type === "stringArray") {
    return (
      <ArrayField
        label={field.label}
        items={value || []}
        newItem={() => ""}
        onChange={onChange}
        render={(item, i, update) => (
          <TextField label={`${field.label} #${i + 1}`} value={item} onChange={update} />
        )}
      />
    );
  }
  if (field.type === "imageArray") {
    return (
      <ArrayField
        label={field.label}
        items={value || []}
        newItem={() => ""}
        onChange={onChange}
        render={(item, i, update) => (
          <ImageField label={`Image ${i + 1}`} value={item} onChange={update} />
        )}
      />
    );
  }
  if (field.type === "array") {
    return (
      <ArrayField
        label={field.label}
        items={value || []}
        newItem={() => makeNew(field.newItem)}
        addLabel={field.addLabel || "Add"}
        onChange={onChange}
        render={(item, i, update) => (
          <div className="flex flex-col gap-3">
            {field.itemFields.map((sub) => (
              <Control
                key={sub.key}
                field={{ ...sub, label: sub.label }}
                value={item?.[sub.key]}
                onChange={(v) => update({ ...item, [sub.key]: v })}
              />
            ))}
          </div>
        )}
      />
    );
  }
  if (field.type === "objectEntries") {
    return (
      <ObjectEntriesField
        label={field.label}
        value={value || {}}
        onChange={onChange}
        newEntry={() => makeNew(field.newEntry)}
        addLabel={field.addLabel || "Add"}
        renderEntry={(item, update) => (
          <div className="flex flex-col gap-3">
            {field.itemFields.map((sub) => (
              <Control
                key={sub.key}
                field={{ ...sub, label: sub.label }}
                value={item?.[sub.key]}
                onChange={(v) => update({ ...item, [sub.key]: v })}
              />
            ))}
          </div>
        )}
      />
    );
  }
  return null;
}

export default function SectionEditor({ descriptor, sectionKey }) {
  // Resolve the descriptor on the client so the server page only passes a
  // string key across the RSC boundary (descriptors contain functions).
  const desc = descriptor || sectionByKey(sectionKey);
  const [config, setConfig] = useState(null);
  const { saving, save } = useSave();

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((j) => {
        if (alive) setConfig(j.data);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!config) return <p className="text-white/60">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{desc.label}</h2>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(config)}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {desc.fields.map((field) => (
          <Control
            key={field.path.join(".")}
            field={field}
            value={getPath(config, field.path)}
            onChange={(v) => setConfig((c) => setPath(c, field.path, v))}
          />
        ))}
      </div>
    </div>
  );
}
