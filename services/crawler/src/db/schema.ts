import { sql } from "drizzle-orm";
import {
	boolean,
	customType,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType: () => "bytea",
});

export const crawlStatus = pgEnum("crawl_status", [
	"pending",
	"active",
	"done",
	"failed",
	"blocked",
]);

export const crawlErrorKind = pgEnum("crawl_error_kind", [
	"fetch",
	"blocked",
	"timeout",
	"parse",
	"handler",
	"unknown",
]);

export const crawlSources = pgTable("crawl_sources", {
	source: text("source").primaryKey(),
	description: text("description"),
	enabled: boolean("enabled").notNull().default(true),
	baseUrl: text("base_url"),
	recrawlIntervalSec: integer("recrawl_interval_sec"),
	rateLimitPerMinute: integer("rate_limit_per_minute"),
	defaultConcurrency: integer("default_concurrency"),
	respectRobotsTxt: boolean("respect_robots_txt").notNull().default(false),
	config: jsonb("config"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const crawlTargets = pgTable(
	"crawl_targets",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		source: text("source")
			.notNull()
			.references(() => crawlSources.source, { onDelete: "restrict" }),
		url: text("url").notNull(),
		urlHash: bytea("url_hash").notNull(),
		contentHash: bytea("content_hash"),
		status: crawlStatus("status").notNull().default("pending"),
		failCount: integer("fail_count").notNull().default(0),
		attemptCount: integer("attempt_count").notNull().default(0),
		lastError: text("last_error"),
		lastErrorKind: crawlErrorKind("last_error_kind"),
		firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
		lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
		nextCrawlAfter: timestamp("next_crawl_after", { withTimezone: true }),
	},
	(t) => [
		uniqueIndex("crawl_targets_source_url_hash_idx").on(t.source, t.urlHash),
		index("crawl_targets_status_next_idx").on(t.status, t.nextCrawlAfter),
		index("crawl_targets_source_last_crawled_idx").on(
			t.source,
			t.lastCrawledAt.desc().nullsLast(),
		),
		index("crawl_targets_source_status_idx").on(t.source, t.status),
		index("crawl_targets_recrawl_idx")
			.on(t.nextCrawlAfter)
			.where(sql`status = 'done' AND next_crawl_after IS NOT NULL`),
	],
);

export const crawlArtifacts = pgTable(
	"crawl_artifacts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		targetId: uuid("target_id")
			.notNull()
			.references(() => crawlTargets.id, { onDelete: "cascade" }),
		version: integer("version").notNull(),
		fetchedAt: timestamp("fetched_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
		contentHash: bytea("content_hash"),
		body: jsonb("body").notNull(),
		bodySize: integer("body_size"),
	},
	(t) => [
		uniqueIndex("crawl_artifacts_target_version_idx").on(t.targetId, t.version),
		index("crawl_artifacts_target_idx").on(t.targetId, t.version.desc()),
	],
);

export type CrawlSource = typeof crawlSources.$inferSelect;
export type NewCrawlSource = typeof crawlSources.$inferInsert;
export type CrawlTarget = typeof crawlTargets.$inferSelect;
export type NewCrawlTarget = typeof crawlTargets.$inferInsert;
export type CrawlArtifact = typeof crawlArtifacts.$inferSelect;
export type NewCrawlArtifact = typeof crawlArtifacts.$inferInsert;
