import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import { relations } from "./relations";

const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle({ relations, client });
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];
