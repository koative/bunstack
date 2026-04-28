export type ProxyTier = "datacenter" | "residential" | "mobile" | "none";

export type JobStatus =
	| "waiting"
	| "active"
	| "completed"
	| "failed"
	| "delayed"
	| "unknown";

export type CrawlOutcome = "success" | "blocked" | "timeout" | "error";

export interface ProxyDescriptor {
	url: string;
	tier: ProxyTier;
	sessionKey?: string;
}

export interface RateLimit {
	perMinute: number;
}

export interface CrawlerConfig {
	concurrency?: number;
	rateLimit?: RateLimit;
	proxy?: { tier: ProxyTier; sticky?: boolean };
	retries?: number;
	timeoutMs?: number;
}

export interface CrawlRequest {
	jobId: string;
	source: string;
	url: string;
	metadata?: Record<string, unknown>;
}

export interface EnqueueItem {
	url: string;
	priority?: number;
	delayMs?: number;
	metadata?: Record<string, unknown>;
}

export interface QueueJob extends EnqueueItem {
	source: string;
	jobId: string;
}

export interface CrawlResult<TData = unknown> {
	data?: TData;
	discovered?: EnqueueItem[];
	contentHash?: Buffer;
}

export interface UpsertTargetInput {
	source: string;
	url: string;
	urlHash: Buffer;
	contentHash?: Buffer;
	status?: "pending" | "done" | "failed";
	nextCrawlAfter?: Date;
}

export interface UpsertResult {
	inserted: boolean;
	id: string;
}

export interface CrawlTargetRow {
	id: string;
	source: string;
	url: string;
	urlHash: Buffer;
	contentHash: Buffer | null;
	status: string;
	failCount: number;
	firstSeenAt: Date;
	lastCrawledAt: Date | null;
	nextCrawlAfter: Date | null;
}
