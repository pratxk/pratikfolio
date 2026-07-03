/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */

export function getPath(obj, path) {
  return path.reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

// Immutable deep set: returns a new object with `path` set to `value`.
export function setPath(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const base = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  base[head] = setPath(base[head], rest, value);
  return base;
}
