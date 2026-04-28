CREATE TYPE "public"."crawl_error_kind" AS ENUM('fetch', 'blocked', 'timeout', 'parse', 'handler', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."crawl_status" AS ENUM('pending', 'active', 'done', 'failed', 'blocked');--> statement-breakpoint
CREATE TABLE "crawl_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" "bytea",
	"body" jsonb NOT NULL,
	"body_size" integer
);
--> statement-breakpoint
CREATE TABLE "crawl_sources" (
	"source" text PRIMARY KEY NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"base_url" text,
	"recrawl_interval_sec" integer,
	"rate_limit_per_minute" integer,
	"default_concurrency" integer,
	"respect_robots_txt" boolean DEFAULT false NOT NULL,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "crawl_targets_status_idx";--> statement-breakpoint
DROP INDEX "crawl_targets_source_idx";--> statement-breakpoint
ALTER TABLE "crawl_targets" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."crawl_status";--> statement-breakpoint
ALTER TABLE "crawl_targets" ALTER COLUMN "status" SET DATA TYPE "public"."crawl_status" USING "status"::"public"."crawl_status";--> statement-breakpoint
ALTER TABLE "crawl_targets" ADD COLUMN "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "crawl_targets" ADD COLUMN "last_error_kind" "crawl_error_kind";--> statement-breakpoint
ALTER TABLE "crawl_artifacts" ADD CONSTRAINT "crawl_artifacts_target_id_crawl_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."crawl_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "crawl_artifacts_target_version_idx" ON "crawl_artifacts" USING btree ("target_id","version");--> statement-breakpoint
CREATE INDEX "crawl_artifacts_target_idx" ON "crawl_artifacts" USING btree ("target_id","version" DESC NULLS LAST);--> statement-breakpoint
INSERT INTO "crawl_sources" ("source") SELECT DISTINCT "source" FROM "crawl_targets" ON CONFLICT ("source") DO NOTHING;--> statement-breakpoint
ALTER TABLE "crawl_targets" ADD CONSTRAINT "crawl_targets_source_crawl_sources_source_fk" FOREIGN KEY ("source") REFERENCES "public"."crawl_sources"("source") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crawl_targets_status_next_idx" ON "crawl_targets" USING btree ("status","next_crawl_after");--> statement-breakpoint
CREATE INDEX "crawl_targets_source_last_crawled_idx" ON "crawl_targets" USING btree ("source","last_crawled_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "crawl_targets_source_status_idx" ON "crawl_targets" USING btree ("source","status");--> statement-breakpoint
CREATE INDEX "crawl_targets_recrawl_idx" ON "crawl_targets" USING btree ("next_crawl_after") WHERE status = 'done' AND next_crawl_after IS NOT NULL;