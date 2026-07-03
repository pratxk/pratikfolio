/**
 * Portfolio Admin CMS
 * Copyright (C) 2026 Pratik Singh
 * Based on Portfolio, Copyright (C) 2025 Maxim (AGPL-3.0).
 */
import { MongoClient } from "mongodb";

let cached = globalThis.__mongo;
if (!cached) cached = globalThis.__mongo = { client: null, promise: null, db: null };

export function _resetForTest() {
  cached.client = null;
  cached.promise = null;
  cached.db = null;
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!cached.client) {
    if (!cached.promise) cached.promise = new MongoClient(uri).connect();
    cached.client = await cached.promise;
  }
  if (!cached.db) cached.db = cached.client.db(process.env.MONGODB_DB || "pratikfolio");
  return cached.db;
}
