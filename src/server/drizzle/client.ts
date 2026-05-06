import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/env";
import { relations } from "./relations";

export const db = drizzle(env.DATABASE_URL, { relations });
export type DBType = typeof db;
export type TXType = Parameters<Parameters<DBType["transaction"]>[0]>[0];
