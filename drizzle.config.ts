import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
    ...(authToken ? { authToken } : {}),
  },
});
