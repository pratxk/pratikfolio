/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ id, children, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-md border border-white/10 bg-white/5 p-3"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-1 cursor-grab select-none px-1 text-white/40"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="flex-1">{children}</div>
      <button
        type="button"
        onClick={onDelete}
        className="mt-1 rounded px-2 text-sm text-red-300 hover:bg-red-500/20"
      >
        Delete
      </button>
    </div>
  );
}

export default function ArrayField({
  label,
  items = [],
  render,
  onChange,
  onReorder,
  newItem,
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const ids = items.map((_, i) => String(i));

  const update = (i, val) =>
    onChange(items.map((it, idx) => (idx === i ? val : it)));

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    const order = arrayMove(
      items.map((_, i) => i),
      from,
      to,
    );
    onChange(order.map((i) => items[i]));
    onReorder?.(order);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="text-sm font-semibold text-white/90">{label}</div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <SortableRow
                key={i}
                id={String(i)}
                onDelete={() =>
                  onChange(items.filter((_, idx) => idx !== i))
                }
              >
                {render(item, i, (val) => update(i, val))}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="self-start rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
      >
        Add
      </button>
    </div>
  );
}
