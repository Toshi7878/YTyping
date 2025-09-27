import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";

// biome-ignore lint/style/noExportedImports: Drizzle 初期化でローカルの `schema` が必要かつ外部公開のため再エクスポートも必要なため
import * as schema from "./schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];

export { schema };
