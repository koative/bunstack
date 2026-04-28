import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type {
	CrawlStore,
	CrawlTargetRow,
	ListTargetsOptions,
	ListTargetsResult,
	SourceSummary,
	UpsertResult,
	UpsertTargetInput,
} from "@eros/crawler-core";
import type { Database } from "../db/client.ts";
import { crawlTargets } from "../db/schema.ts";

export class PostgresCrawlStore implements CrawlStore {
	constructor(private readonly db: Database) {}

	async upsertTarget(input: UpsertTargetInput): Promise<UpsertResult> {
		const rows = await this.db
			.insert(crawlTargets)
			.values({
				source: input.source,
				url: input.url,
				urlHash: input.urlHash,
				contentHash: input.contentHash,
				status: input.status ?? "pending",
				nextCrawlAfter: input.nextCrawlAfter,
			})
			.onConflictDoUpdate({
				target: [crawlTargets.source, crawlTargets.urlHash],
				set: {
					contentHash: sql`excluded.content_hash`,
					status: sql`excluded.status`,
					nextCrawlAfter: sql`excluded.next_crawl_after`,
					lastCrawledAt: sql`now()`,
				},
			})
			.returning({ id: crawlTargets.id, xmax: sql<number>`xmax` });

		const row = rows[0];
		if (!row) throw new Error("upsert returned no rows");
		return { id: row.id, inserted: Number(row.xmax) === 0 };
	}

	async findByHash(
		source: string,
		urlHash: Buffer,
	): Promise<CrawlTargetRow | null> {
		const rows = await this.db
			.select()
			.from(crawlTargets)
			.where(and(eq(crawlTargets.source, source), eq(crawlTargets.urlHash, urlHash)))
			.limit(1);
		return rows[0] ?? null;
	}

	async markFailed(
		source: string,
		urlHash: Buffer,
		reason: string,
	): Promise<void> {
		await this.db
			.update(crawlTargets)
			.set({
				status: "failed",
				lastError: reason,
				failCount: sql`${crawlTargets.failCount} + 1`,
				lastCrawledAt: sql`now()`,
			})
			.where(and(eq(crawlTargets.source, source), eq(crawlTargets.urlHash, urlHash)));
	}

	async markDone(
		source: string,
		urlHash: Buffer,
		contentHash: Buffer | null,
	): Promise<void> {
		await this.db
			.update(crawlTargets)
			.set({
				status: "done",
				contentHash,
				failCount: 0,
				lastError: null,
				lastCrawledAt: sql`now()`,
			})
			.where(and(eq(crawlTargets.source, source), eq(crawlTargets.urlHash, urlHash)));
	}

	async listTargets(
		source: string,
		opts: ListTargetsOptions = {},
	): Promise<ListTargetsResult> {
		const limit = Math.min(opts.limit ?? 50, 200);
		const offset = opts.offset ?? 0;

		const conditions = [eq(crawlTargets.source, source)];
		if (opts.status) conditions.push(eq(crawlTargets.status, opts.status));
		if (opts.search) conditions.push(ilike(crawlTargets.url, `%${opts.search}%`));

		const where = conditions.length === 1 ? conditions[0] : and(...conditions);

		const [rows, totalRow] = await Promise.all([
			this.db
				.select()
				.from(crawlTargets)
				.where(where)
				.orderBy(desc(crawlTargets.lastCrawledAt), desc(crawlTargets.firstSeenAt))
				.limit(limit)
				.offset(offset),
			this.db
				.select({ count: count() })
				.from(crawlTargets)
				.where(where),
		]);

		return { rows, total: totalRow[0]?.count ?? 0 };
	}

	async summarize(sources: string[]): Promise<SourceSummary[]> {
		if (sources.length === 0) return [];
		const rows = await this.db
			.select({
				source: crawlTargets.source,
				status: crawlTargets.status,
				cnt: count(),
				lastCrawledAt: sql<Date | null>`max(${crawlTargets.lastCrawledAt})`,
			})
			.from(crawlTargets)
			.where(inArray(crawlTargets.source, sources))
			.groupBy(crawlTargets.source, crawlTargets.status);

		const summary = new Map<string, SourceSummary>();
		for (const s of sources) {
			summary.set(s, {
				source: s,
				total: 0,
				pending: 0,
				done: 0,
				failed: 0,
				lastCrawledAt: null,
			});
		}
		for (const r of rows) {
			const entry = summary.get(r.source);
			if (!entry) continue;
			entry.total += r.cnt;
			if (r.status === "pending") entry.pending = r.cnt;
			else if (r.status === "done") entry.done = r.cnt;
			else if (r.status === "failed") entry.failed = r.cnt;
			if (r.lastCrawledAt && (!entry.lastCrawledAt || r.lastCrawledAt > entry.lastCrawledAt)) {
				entry.lastCrawledAt = r.lastCrawledAt;
			}
		}
		return [...summary.values()];
	}
}
