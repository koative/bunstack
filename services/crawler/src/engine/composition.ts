import type { ConnectionOptions } from "bullmq";
import { env } from "../env.ts";
import { bunSql, db } from "../db/client.ts";
import { createRedis } from "../infra/redis.ts";
import { RedisDedup } from "../infra/dedup.ts";
import { PostgresCrawlStore } from "../infra/store.ts";
import { BullMqQueue } from "../infra/queue.ts";
import { HttpFetcher } from "../infra/fetcher.ts";
import { NoopProxyProvider } from "../infra/proxy.ts";
import { logger } from "../infra/logger.ts";
import { HandlerRegistry } from "./registry.ts";
import { JobSubmitter } from "./submit.ts";
import { CrawlWorkerPool } from "./worker.ts";

export function buildEngine() {
	const redis = createRedis();
	const connection: ConnectionOptions = { url: env.REDIS_URL };

	const store = new PostgresCrawlStore(db, bunSql);
	const dedup = new RedisDedup(redis, env.BULLMQ_PREFIX);
	const queue = new BullMqQueue(connection);
	const fetcher = new HttpFetcher();
	const proxy = new NoopProxyProvider();
	const registry = new HandlerRegistry();

	const submitter = new JobSubmitter(registry, queue, dedup, store, logger);
	const workers = new CrawlWorkerPool({
		registry,
		submitter,
		store,
		fetcher,
		proxy,
		log: logger,
		connection,
	});
	async function syncRegistryToDatabase(): Promise<void> {
		await Promise.all(
			registry.list().map((h) =>
				store.upsertSource({
					source: h.source,
					rateLimitPerMinute: h.config?.rateLimit?.perMinute,
					defaultConcurrency: h.config?.concurrency,
				}),
			),
		);
	}

	return {
		registry,
		queue,
		store,
		dedup,
		submitter,
		workers,
		redis,
		log: logger,
		syncRegistryToDatabase,
	};
}

export type Engine = ReturnType<typeof buildEngine>;
