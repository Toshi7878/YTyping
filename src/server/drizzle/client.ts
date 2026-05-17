import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import { relations } from "./relations";

const globalForDb = globalThis as unknown as { client: postgres.Sql | undefined };

const client = globalForDb.client ?? postgres(env.DATABASE_URL, { prepare: false });
globalForDb.client = client;

export const db = drizzle({ relations, client });
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];
