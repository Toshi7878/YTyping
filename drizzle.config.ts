import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  strict: true,
});

