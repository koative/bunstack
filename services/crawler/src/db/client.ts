import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import { env } from "../env.ts";
import * as schema from "./schema.ts";

export const bunSql = new SQL(env.DATABASE_URL);
export const db = drizzle({ client: bunSql, schema });
export type Database = typeof db;
export type BunSqlClient = typeof bunSql;
