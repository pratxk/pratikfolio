/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import { unstable_cache, revalidateTag } from "next/cache";
import fallbackConfig from "/CONFIG.json";
import { getDb } from "@/lib/db.js";
import { configSchema } from "@/lib/config-schema.js";

export const SINGLETON_ID = "singleton";
const COLLECTION = "config";

export async function readConfig() {
  if (!process.env.MONGODB_URI) return fallbackConfig;
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: SINGLETON_ID });
    return doc?.data ?? fallbackConfig;
  } catch {
    return fallbackConfig;
  }
}

export const getConfig = unstable_cache(readConfig, ["portfolio-config"], {
  tags: ["config"],
});

export async function updateConfig(nextData) {
  const data = configSchema.parse(nextData);
  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { _id: SINGLETON_ID },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true },
  );
  revalidateTag("config");
  return data;
}

function getAtPath(root, pathArray) {
  return pathArray.reduce((acc, k) => (acc == null ? acc : acc[k]), root);
}

export async function reorderInConfig(pathArray, orderIndexes) {
  const cfg = await readConfig();
  const clone = structuredClone(cfg);
  const arr = getAtPath(clone, pathArray);
  if (!Array.isArray(arr)) throw new Error("path is not an array");
  const reordered = orderIndexes.map((i) => arr[i]);
  const parent = getAtPath(clone, pathArray.slice(0, -1));
  parent[pathArray[pathArray.length - 1]] = reordered;
  return updateConfig(clone);
}
