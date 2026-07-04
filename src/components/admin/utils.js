/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */

// Build a fresh item from a descriptor's newItem/newEntry (factory fn or template).
export function makeNew(spec) {
  if (typeof spec === "function") return spec();
  return structuredClone(spec ?? {});
}

// Derive a human label for an entity card from its preview hints, with fallbacks.
export function cardTitle(item, preview) {
  if (!item) return "Untitled";
  const t = preview?.title && item[preview.title];
  return (typeof t === "string" && t.trim()) || "Untitled";
}
export function cardSubtitle(item, preview) {
  const s = preview?.subtitle && item?.[preview.subtitle];
  return typeof s === "string" ? s : "";
}
export function cardImage(item, preview) {
  const img = preview?.image && item?.[preview.image];
  return typeof img === "string" && img ? img : "";
}
