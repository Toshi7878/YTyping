import { defineConfig } from "drizzle-kit"
import { env } from "@/env"

if (!env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL")
}

export default defineConfig({
  schema: "./src/server/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  strict: true,
})
