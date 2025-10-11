import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

// biome-ignore lint/style/noExportedImports: Drizzle 初期化でローカルの `schema` が必要かつ外部公開のため再エクスポートも必要なため
import * as schema from "./schema";

const connectionString = env.DATABASE_URL;

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];

export { schema };
