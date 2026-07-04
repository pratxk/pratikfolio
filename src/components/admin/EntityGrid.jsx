/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Modal from "@/components/admin/ui/Modal.jsx";
import ItemForm from "@/components/admin/ItemForm.jsx";
import TextField from "@/components/admin/fields/TextField.jsx";
import { makeNew, cardTitle, cardSubtitle, cardImage } from "@/components/admin/utils.js";

function EntityCard({ id, item, preview, keyed, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const title = keyed ? id : cardTitle(item, preview);
  const subtitle = cardSubtitle(item, preview);
  const img = cardImage(item, preview);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25 hover:bg-white/[0.06]"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute left-2 top-2 z-10 cursor-grab rounded-md bg-black/40 px-1.5 py-0.5 text-white/50 opacity-0 backdrop-blur transition group-hover:opacity-100"
      >
        ⠿
      </button>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-cyan-500/10 to-white/5 text-3xl text-white/20">
          {title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="truncate font-semibold text-white">{title}</h4>
        {subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-white/50">{subtitle}</p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-sm text-white/90 hover:bg-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/15"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Grid of preview cards for an array OR keyed-object field. Edit/Add open a
// modal form; drag reorders. Every mutation is pushed up via onChange.
export default function EntityGrid({
  title,
  value,
  fields,
  preview,
  keyed = false,
  newSpec,
  addLabel = "Add",
  onChange,
  saving,
}) {
  const entries = keyed
    ? Object.entries(value || {})
    : (value || []).map((v, i) => [String(i), v]);
  const ids = entries.map(([k]) => k);
  const sensors = useSensors(useSensor(PointerSensor));

  // editing = { key, draft, keyName, isNew }
  const [editing, setEditing] = useState(null);

  function commitArray(next) {
    onChange(next);
  }

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (keyed) {
      const ordered = arrayMove(entries, from, to);
      commitArray(Object.fromEntries(ordered));
    } else {
      commitArray(arrayMove(value, from, to));
    }
  }

  function openAdd() {
    setEditing({
      isNew: true,
      keyName: keyed ? "" : undefined,
      draft: makeNew(newSpec),
    });
  }
  function openEdit(key) {
    const item = keyed ? value[key] : value[Number(key)];
    setEditing({
      isNew: false,
      key,
      keyName: keyed ? key : undefined,
      draft: structuredClone(item),
    });
  }
  function del(key) {
    if (keyed) {
      const next = { ...value };
      delete next[key];
      commitArray(next);
    } else {
      commitArray(value.filter((_, i) => i !== Number(key)));
    }
  }
  function saveEditing() {
    const { isNew, key, keyName, draft } = editing;
    if (keyed) {
      const k = (keyName || "").trim() || "untitled";
      const next = { ...value };
      if (!isNew && key !== k) delete next[key];
      next[k] = draft;
      commitArray(next);
    } else if (isNew) {
      commitArray([...(value || []), draft]);
    } else {
      commitArray(value.map((v, i) => (i === Number(key) ? draft : v)));
    }
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-cyan-400"
        >
          + {addLabel}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 py-16 text-center text-white/40">
          Nothing here yet — click “{addLabel}” to create one.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {entries.map(([key, item]) => (
                <EntityCard
                  key={key}
                  id={key}
                  item={item}
                  preview={preview}
                  keyed={keyed}
                  onEdit={() => openEdit(key)}
                  onDelete={() => del(key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        open={!!editing}
        title={editing?.isNew ? `New ${title}` : `Edit ${title}`}
        onClose={() => setEditing(null)}
        onSave={saveEditing}
        saving={saving}
      >
        {editing && (
          <div className="flex flex-col gap-4">
            {keyed && (
              <TextField
                label="Identifier (unique key)"
                value={editing.keyName}
                onChange={(v) => setEditing((e) => ({ ...e, keyName: v }))}
              />
            )}
            <ItemForm
              fields={fields}
              value={editing.draft}
              onChange={(d) => setEditing((e) => ({ ...e, draft: d }))}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
