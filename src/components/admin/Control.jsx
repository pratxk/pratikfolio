/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import TextField from "@/components/admin/fields/TextField.jsx";
import TextareaField from "@/components/admin/fields/TextareaField.jsx";
import ColorField from "@/components/admin/fields/ColorField.jsx";
import ToggleField from "@/components/admin/fields/ToggleField.jsx";
import ImageField from "@/components/admin/fields/ImageField.jsx";
import ArrayField from "@/components/admin/fields/ArrayField.jsx";
import ObjectEntriesField from "@/components/admin/fields/ObjectEntriesField.jsx";
import TagsField from "@/components/admin/fields/TagsField.jsx";
import { makeNew } from "@/components/admin/utils.js";

const SCALARS = {
  text: TextField,
  textarea: TextareaField,
  color: ColorField,
  toggle: ToggleField,
  image: ImageField,
};

// Renders one field control (recursively for arrays/objects). Used inside
// item forms and modals — arrays/objects render inline here (no nested modals).
export default function Control({ field, value, onChange }) {
  if (SCALARS[field.type]) {
    const C = SCALARS[field.type];
    return <C label={field.label} value={value} onChange={onChange} />;
  }
  if (field.type === "stringArray") {
    return <TagsField label={field.label} value={value || []} onChange={onChange} />;
  }
  if (field.type === "imageArray") {
    return (
      <ArrayField
        label={field.label}
        items={value || []}
        newItem={() => ""}
        addLabel="Add image"
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
                field={sub}
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
                field={sub}
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
