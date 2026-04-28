import { Worker, type ConnectionOptions, type Job } from "bullmq";
import {
	type CrawlContext,
	type CrawlResult,
	type Fetcher,
	type Logger,
	type ProxyProvider,
	type CrawlStore,
	type QueueJob,
	urlHash,
	normalizeUrl,
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
			const w = new Worker<QueueJob>(
				queueName(handler.source),
				(job) => this.process(job),
				{
					connection: this.deps.connection,
					concurrency,
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
			await store.markDone(data.source, hash, result.contentHash ?? null);
			return result;
		} catch (err) {
			const e = err as Error;
			await store.markFailed(data.source, hash, e.message);
			throw err;
		}
	}

	async stop(): Promise<void> {
		await Promise.all(this.workers.map((w) => w.close()));
		this.workers.length = 0;
	}
}
