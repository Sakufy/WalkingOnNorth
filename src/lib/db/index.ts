import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Use @libsql/client/node to force Node.js code path.
 * Default export resolves to WASM in some bundlers (Turbopack),
 * which doesn't support file: URLs.
 * Pure JS — zero native dependencies, works everywhere.
 */
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
});

export const db = drizzle(client, { schema });
