import { and, asc, count, desc, eq, ilike, inArray, lte, sql } from "drizzle-orm";
import type {
	ArtifactRecordResult,
	CrawlArtifactInput,
	CrawlArtifactRow,
	CrawlSourceDef,
	CrawlSourceRow,
	CrawlStore,
	CrawlStatus,
	CrawlTargetRow,
	ErrorKind,
	ListTargetsOptions,
	ListTargetsResult,
	MarkDoneInput,
	MarkFailedInput,
	SourceSummary,
	StaleTargetQuery,
	UpsertResult,
	UpsertTargetInput,
} from "@eros/crawler-core";
import type { BunSqlClient, Database } from "../db/client.ts";
import { crawlArtifacts, crawlSources, crawlTargets } from "../db/schema.ts";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class PostgresCrawlStore implements CrawlStore {
	constructor(
		private readonly db: Database,
		private readonly bunSql: BunSqlClient,
	) {}

	async upsertSource(def: CrawlSourceDef): Promise<void> {
		await this.db
			.insert(crawlSources)
			.values({
				source: def.source,
				description: def.description,
				enabled: def.enabled ?? true,
				baseUrl: def.baseUrl,
				recrawlIntervalSec: def.recrawlIntervalSec,
				rateLimitPerMinute: def.rateLimitPerMinute,
				defaultConcurrency: def.defaultConcurrency,
				respectRobotsTxt: def.respectRobotsTxt ?? false,
				config: def.config,
			})
			.onConflictDoUpdate({
				target: crawlSources.source,
				set: {
					description: def.description,
					baseUrl: def.baseUrl,
					recrawlIntervalSec: def.recrawlIntervalSec,
					rateLimitPerMinute: def.rateLimitPerMinute,
					defaultConcurrency: def.defaultConcurrency,
					respectRobotsTxt: def.respectRobotsTxt ?? false,
					config: def.config,
					updatedAt: sql`now()`,
				},
			});
	}

	async listSources(): Promise<CrawlSourceRow[]> {
		const rows = await this.db.select().from(crawlSources).orderBy(crawlSources.source);
		return rows.map((r) => ({
			source: r.source,
			description: r.description ?? undefined,
			enabled: r.enabled,
			baseUrl: r.baseUrl ?? undefined,
			recrawlIntervalSec: r.recrawlIntervalSec ?? undefined,
			rateLimitPerMinute: r.rateLimitPerMinute ?? undefined,
			defaultConcurrency: r.defaultConcurrency ?? undefined,
			respectRobotsTxt: r.respectRobotsTxt,
			config: (r.config as Record<string, unknown> | null) ?? undefined,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}));
	}

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
					nextCrawlAfter: sql`excluded.next_crawl_after`,
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
		const r = rows[0];
		return r ? this.toTargetRow(r) : null;
	}

	async markFailed(input: MarkFailedInput): Promise<void> {
		const finalStatus: CrawlStatus = input.terminal
			? input.kind === "blocked"
				? "blocked"
				: "failed"
			: "pending";

		await this.db
			.update(crawlTargets)
			.set({
				status: finalStatus,
				lastError: input.reason.slice(0, 2000),
				lastErrorKind: input.kind,
				failCount: sql`${crawlTargets.failCount} + 1`,
				attemptCount: sql`${crawlTargets.attemptCount} + 1`,
				lastCrawledAt: sql`now()`,
			})
			.where(
				and(
					eq(crawlTargets.source, input.source),
					eq(crawlTargets.urlHash, input.urlHash),
				),
			);
	}

	async markDone(input: MarkDoneInput): Promise<ArtifactRecordResult> {
		return (await this.bunSql.begin(async (tx) => {
			const [target] = (await tx`
				UPDATE crawl_targets
				SET
					status = 'done',
					content_hash = ${input.contentHash},
					fail_count = 0,
					last_error = NULL,
					last_error_kind = NULL,
					attempt_count = attempt_count + 1,
					last_crawled_at = now(),
					next_crawl_after = ${input.nextCrawlAfter ?? null}
				WHERE source = ${input.source} AND url_hash = ${input.contentHash !== null ? input.urlHash : input.urlHash}
				RETURNING id
			`) as Array<{ id: string }>;

			if (!target) {
				throw new Error(
					`markDone: no target for source=${input.source} hash=${input.urlHash.toString("hex").slice(0, 8)}`,
				);
			}

			return await this.recordArtifactBunTx(tx, {
				targetId: target.id,
				contentHash: input.contentHash,
				body: input.body,
				bodySize: input.bodySize,
			});
		})) as ArtifactRecordResult;
	}

	async recordArtifact(input: CrawlArtifactInput): Promise<ArtifactRecordResult> {
		return (await this.bunSql.begin((tx) =>
			this.recordArtifactBunTx(tx, input),
		)) as ArtifactRecordResult;
	}

	private async recordArtifactBunTx(
		tx: BunSqlClient,
		input: CrawlArtifactInput,
	): Promise<ArtifactRecordResult> {
		const latest = (await tx`
			SELECT version, content_hash FROM crawl_artifacts
			WHERE target_id = ${input.targetId}::uuid
			ORDER BY version DESC LIMIT 1
		`) as Array<{ version: number; content_hash: Buffer | null }>;

		const prev = latest[0];
		const sameContent =
			prev?.content_hash != null &&
			input.contentHash != null &&
			Buffer.from(prev.content_hash).equals(input.contentHash);

		if (sameContent) {
			return { inserted: false, version: prev.version, artifactId: null };
		}

		const nextVersion = (prev?.version ?? 0) + 1;
		const bodyValue = (input.body ?? null) as object | null;
		const inserted = (await tx`
			INSERT INTO crawl_artifacts (target_id, version, content_hash, body, body_size)
			VALUES (
				${input.targetId}::uuid,
				${nextVersion},
				${input.contentHash},
				${bodyValue},
				${input.bodySize ?? null}
			)
			RETURNING id
		`) as Array<{ id: string }>;

		const id = inserted[0]?.id;
		if (!id) throw new Error("artifact insert returned no rows");
		return { inserted: true, version: nextVersion, artifactId: id };
	}

	async latestArtifact(targetId: string): Promise<CrawlArtifactRow | null> {
		const rows = await this.db
			.select()
			.from(crawlArtifacts)
			.where(eq(crawlArtifacts.targetId, targetId))
			.orderBy(desc(crawlArtifacts.version))
			.limit(1);
		const r = rows[0];
		return r
			? {
					id: r.id,
					targetId: r.targetId,
					version: r.version,
					fetchedAt: r.fetchedAt,
					contentHash: r.contentHash,
					body: r.body,
					bodySize: r.bodySize,
				}
			: null;
	}

	async listTargets(
		source: string,
		opts: ListTargetsOptions = {},
	): Promise<ListTargetsResult> {
		const limit = Math.min(opts.limit ?? 50, 200);
		const offset = opts.offset ?? 0;

		const conditions = [eq(crawlTargets.source, source)];
		if (opts.status) {
			conditions.push(eq(crawlTargets.status, opts.status as CrawlStatus));
		}
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
			this.db.select({ count: count() }).from(crawlTargets).where(where),
		]);

		return { rows: rows.map((r) => this.toTargetRow(r)), total: totalRow[0]?.count ?? 0 };
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
			else if (r.status === "failed" || r.status === "blocked")
				entry.failed += r.cnt;
			if (
				r.lastCrawledAt &&
				(!entry.lastCrawledAt || r.lastCrawledAt > entry.lastCrawledAt)
			) {
				entry.lastCrawledAt = r.lastCrawledAt;
			}
		}
		return [...summary.values()];
	}

	async findStaleTargets(opts: StaleTargetQuery): Promise<CrawlTargetRow[]> {
		const limit = Math.min(opts.limit ?? 100, 500);
		const now = opts.now ?? new Date();

		const conditions = [
			eq(crawlTargets.status, "done" as CrawlStatus),
			lte(crawlTargets.nextCrawlAfter, now),
		];
		if (opts.source) conditions.push(eq(crawlTargets.source, opts.source));

		const rows = await this.db
			.select()
			.from(crawlTargets)
			.where(and(...conditions))
			.orderBy(asc(crawlTargets.nextCrawlAfter))
			.limit(limit);

		return rows.map((r) => this.toTargetRow(r));
	}

	private toTargetRow(r: typeof crawlTargets.$inferSelect): CrawlTargetRow {
		return {
			id: r.id,
			source: r.source,
			url: r.url,
			urlHash: r.urlHash,
			contentHash: r.contentHash,
			status: r.status as CrawlStatus,
			failCount: r.failCount,
			attemptCount: r.attemptCount,
			lastError: r.lastError,
			lastErrorKind: r.lastErrorKind as ErrorKind | null,
			firstSeenAt: r.firstSeenAt,
			lastCrawledAt: r.lastCrawledAt,
			nextCrawlAfter: r.nextCrawlAfter,
		};
	}
}
