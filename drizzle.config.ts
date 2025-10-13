import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

// biome-ignore lint/style/noDefaultExport: <export defaultする必要がある>
export default defineConfig({
  schema: "./src/server/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  strict: true,
});
