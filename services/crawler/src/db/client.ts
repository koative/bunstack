import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import { env } from "../env.ts";
import * as schema from "./schema.ts";

export const sql = new SQL(env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
export type Database = typeof db;
