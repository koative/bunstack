import { z } from "zod";

const Schema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.coerce.number().int().positive().default(1337),
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
	WORKER_CONCURRENCY: z.coerce.number().int().positive().default(4),
	BULLMQ_PREFIX: z.string().default("eros:crawl"),
	RECRAWL_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
});

export type Env = z.infer<typeof Schema>;

export const env: Env = Schema.parse(process.env);
