CREATE TABLE "crawl_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"url_hash" "bytea" NOT NULL,
	"content_hash" "bytea",
	"status" text DEFAULT 'pending' NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_crawled_at" timestamp with time zone,
	"next_crawl_after" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "crawl_targets_source_url_hash_idx" ON "crawl_targets" USING btree ("source","url_hash");--> statement-breakpoint
CREATE INDEX "crawl_targets_status_idx" ON "crawl_targets" USING btree ("status","next_crawl_after");--> statement-breakpoint
CREATE INDEX "crawl_targets_source_idx" ON "crawl_targets" USING btree ("source");