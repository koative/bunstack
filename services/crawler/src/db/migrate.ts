import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db, bunSql } from "./client.ts";

await migrate(db, { migrationsFolder: "./drizzle" });
await bunSql.end();
console.log("migrations applied");
