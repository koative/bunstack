import { sql } from "drizzle-orm";
import {
	customType,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType: () => "bytea",
});

export const crawlTargets = pgTable(
	"crawl_targets",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		source: text("source").notNull(),
		url: text("url").notNull(),
		urlHash: bytea("url_hash").notNull(),
		contentHash: bytea("content_hash"),
		status: text("status").notNull().default("pending"),
		failCount: integer("fail_count").notNull().default(0),
		lastError: text("last_error"),
		firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
		lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
		nextCrawlAfter: timestamp("next_crawl_after", { withTimezone: true }),
	},
	(t) => [
		uniqueIndex("crawl_targets_source_url_hash_idx").on(t.source, t.urlHash),
		index("crawl_targets_status_idx").on(t.status, t.nextCrawlAfter),
		index("crawl_targets_source_idx").on(t.source),
	],
);

export type CrawlTarget = typeof crawlTargets.$inferSelect;
export type NewCrawlTarget = typeof crawlTargets.$inferInsert;
