/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 * Usage: node scripts/seed.js   (loads .env.local)
 */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// minimal .env.local loader
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

(async () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../CONFIG.json"), "utf8"),
  );
  const client = await new MongoClient(process.env.MONGODB_URI).connect();
  const db = client.db(process.env.MONGODB_DB || "pratikfolio");

  await db.collection("config").updateOne(
    { _id: "singleton" },
    { $set: { data: config, updatedAt: new Date() } },
    { upsert: true },
  );
  console.log("✓ config singleton seeded");

  const email = process.env.ADMIN_EMAIL;
  const pw = process.env.ADMIN_PASSWORD;
  if (!email || !pw || email.includes("CHANGE_ME") || pw.includes("CHANGE_ME")) {
    console.log("! ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed");
  } else {
    const passwordHash = await bcrypt.hash(pw, 12);
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("admins").updateOne(
      { email },
      { $set: { email, passwordHash }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    console.log(`✓ admin ${email} seeded`);
  }
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
