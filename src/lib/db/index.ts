import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Use @libsql/client/node to force Node.js code path.
 * Default export resolves to WASM in some bundlers (Turbopack),
 * which doesn't support file: URLs.
 * Pure JS — zero native dependencies, works everywhere.
 *
 * When TURSO_AUTH_TOKEN is set, connects to Turso cloud.
 * When absent, falls back to local SQLite (file:local.db).
 */
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client, { schema });
