import {
	type DedupStore,
	type EnqueueItem,
	type Logger,
	normalizeUrl,
	type QueueAdapter,
	type CrawlStore,
	urlHash,
} from "@eros/crawler-core";
import type { HandlerRegistry } from "./registry.ts";

export interface SubmitInput {
	source: string;
	items: EnqueueItem[];
}

export interface SubmitResult {
	accepted: number;
	skipped: number;
	jobIds: string[];
}

export class JobSubmitter {
	constructor(
		private readonly registry: HandlerRegistry,
		private readonly queue: QueueAdapter,
		private readonly dedup: DedupStore,
		private readonly store: CrawlStore,
		private readonly log: Logger,
	) {}

	async submit({ source, items }: SubmitInput): Promise<SubmitResult> {
		this.registry.get(source);

		const result: SubmitResult = { accepted: 0, skipped: 0, jobIds: [] };
		const toEnqueue: { jobId: string; url: string; item: EnqueueItem; hash: Buffer }[] = [];

		for (const item of items) {
			const normalized = safeNormalize(item.url);
			if (!normalized) {
				result.skipped++;
				continue;
			}
			const hash = urlHash(normalized);
			const jobId = `${source}:${hash.toString("hex")}`;

			if (await this.dedup.has(jobId)) {
				const existing = await this.store.findByHash(source, hash);
				if (
					existing &&
					existing.status === "done" &&
					(!existing.nextCrawlAfter || existing.nextCrawlAfter > new Date())
				) {
					result.skipped++;
					continue;
				}
			}
			toEnqueue.push({ jobId, url: normalized, item, hash });
		}

		if (toEnqueue.length === 0) return result;

		await Promise.all(
			toEnqueue.map((t) =>
				this.store.upsertTarget({
					source,
					url: t.url,
					urlHash: t.hash,
					status: "pending",
				}),
			),
		);

		const ids = await this.queue.enqueueMany(
			toEnqueue.map((t) => ({
				source,
				jobId: t.jobId,
				url: t.url,
				priority: t.item.priority,
				delayMs: t.item.delayMs,
				metadata: t.item.metadata,
			})),
		);

		await this.dedup.addMany(toEnqueue.map((t) => t.jobId));

		result.accepted = toEnqueue.length;
		result.jobIds = ids;

		this.log.info("jobs submitted", {
			source,
			accepted: result.accepted,
			skipped: result.skipped,
		});

		return result;
	}
}

function safeNormalize(raw: string): string | null {
	try {
		return normalizeUrl(raw);
	} catch {
		return null;
	}
}
