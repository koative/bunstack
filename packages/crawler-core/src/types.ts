export type ProxyTier = "datacenter" | "residential" | "mobile" | "none";

export type JobStatus =
	| "waiting"
	| "active"
	| "completed"
	| "failed"
	| "delayed"
	| "unknown";

export type CrawlOutcome = "success" | "blocked" | "timeout" | "error";

export type ErrorKind =
	| "fetch"
	| "blocked"
	| "timeout"
	| "parse"
	| "handler"
	| "unknown";

export type CrawlStatus =
	| "pending"
	| "active"
	| "done"
	| "failed"
	| "blocked";

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
	recrawlIntervalSec?: number;
	respectRobotsTxt?: boolean;
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
	status?: CrawlStatus;
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
	status: CrawlStatus;
	failCount: number;
	attemptCount: number;
	lastError: string | null;
	lastErrorKind: ErrorKind | null;
	firstSeenAt: Date;
	lastCrawledAt: Date | null;
	nextCrawlAfter: Date | null;
}

export interface CrawlSourceDef {
	source: string;
	description?: string;
	enabled?: boolean;
	baseUrl?: string;
	recrawlIntervalSec?: number;
	rateLimitPerMinute?: number;
	defaultConcurrency?: number;
	respectRobotsTxt?: boolean;
	config?: Record<string, unknown>;
}

export interface CrawlSourceRow extends CrawlSourceDef {
	createdAt: Date;
	updatedAt: Date;
}

export interface CrawlArtifactInput {
	targetId: string;
	contentHash: Buffer | null;
	body: unknown;
	bodySize?: number;
}

export interface CrawlArtifactRow {
	id: string;
	targetId: string;
	version: number;
	fetchedAt: Date;
	contentHash: Buffer | null;
	body: unknown;
	bodySize: number | null;
}

export interface ArtifactRecordResult {
	inserted: boolean;
	version: number;
	artifactId: string | null;
}

export interface StaleTargetQuery {
	limit?: number;
	source?: string;
	now?: Date;
}
