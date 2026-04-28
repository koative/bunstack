import { Worker, type ConnectionOptions, type Job } from "bullmq";
import {
	classifyError,
	type CrawlContext,
	type CrawlResult,
	type CrawlStore,
	type Fetcher,
	type Logger,
	type ProxyProvider,
	type QueueJob,
	normalizeUrl,
	urlHash,
} from "@eros/crawler-core";
import { env } from "../env.ts";
import type { HandlerRegistry } from "./registry.ts";
import type { JobSubmitter } from "./submit.ts";
import { queueName } from "../infra/queue.ts";

export interface WorkerDeps {
	registry: HandlerRegistry;
	submitter: JobSubmitter;
	store: CrawlStore;
	fetcher: Fetcher;
	proxy: ProxyProvider;
	log: Logger;
	connection: ConnectionOptions;
}

export class CrawlWorkerPool {
	private readonly workers: Worker[] = [];

	constructor(private readonly deps: WorkerDeps) {}

	start(): void {
		for (const handler of this.deps.registry.list()) {
			const concurrency = handler.config?.concurrency ?? env.WORKER_CONCURRENCY;
			const limiter = handler.config?.rateLimit
				? { max: handler.config.rateLimit.perMinute, duration: 60_000 }
				: undefined;

			const w = new Worker<QueueJob>(
				queueName(handler.source),
				(job) => this.process(job),
				{
					connection: this.deps.connection,
					prefix: env.BULLMQ_PREFIX,
					concurrency,
					limiter,
					autorun: true,
				},
			);

			w.on("failed", (job, err) => {
				this.deps.log.error("job failed", {
					source: handler.source,
					jobId: job?.id,
					err: err.message,
				});
			});
			w.on("error", (err) => {
				this.deps.log.error("worker error", {
					source: handler.source,
					err: err.message,
				});
			});

			this.workers.push(w);
			this.deps.log.info("worker started", {
				source: handler.source,
				concurrency,
				rateLimitPerMinute: handler.config?.rateLimit?.perMinute ?? null,
			});
		}
	}

	private async process(job: Job<QueueJob>): Promise<CrawlResult> {
		const { registry, submitter, store, fetcher, log } = this.deps;
		const data = job.data;
		const handler = registry.get(data.source);
		const childLog = log.child({ source: data.source, jobId: data.jobId });
		const ctrl = new AbortController();

		const ctx: CrawlContext = {
			request: {
				jobId: data.jobId,
				source: data.source,
				url: data.url,
				metadata: data.metadata,
			},
			fetch: fetcher,
			log: childLog,
			store,
			signal: ctrl.signal,
			enqueue: async (items) => {
				await submitter.submit({ source: data.source, items });
			},
		};

		const hash = urlHash(normalizeUrl(data.url));

		try {
			const result = await handler.handle(ctx);
			const bodySize = serializeSize(result.data);
			const nextCrawlAfter = handler.config?.recrawlIntervalSec
				? new Date(Date.now() + handler.config.recrawlIntervalSec * 1000)
				: null;

			const record = await store.markDone({
				source: data.source,
				urlHash: hash,
				contentHash: result.contentHash ?? null,
				body: result.data ?? null,
				bodySize,
				nextCrawlAfter,
			});

			childLog.info("job done", {
				artifactInserted: record.inserted,
				version: record.version,
				bodySize,
			});

			return result;
		} catch (err) {
			const kind = classifyError(err);
			const message = err instanceof Error ? err.message : String(err);
			const attemptsMade = job.attemptsMade + 1;
			const totalAttempts = job.opts.attempts ?? 1;
			const terminal = attemptsMade >= totalAttempts;

			await store.markFailed({
				source: data.source,
				urlHash: hash,
				reason: message,
				kind,
				terminal,
			});

			throw err;
		}
	}

	async stop(): Promise<void> {
		await Promise.all(this.workers.map((w) => w.close()));
		this.workers.length = 0;
	}
}

function serializeSize(value: unknown): number | undefined {
	if (value == null) return undefined;
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return undefined;
	}
}
