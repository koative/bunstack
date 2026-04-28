import type {
	CrawlTargetRow,
	UpsertResult,
	UpsertTargetInput,
} from "../types.ts";

export interface ListTargetsOptions {
	status?: string;
	limit?: number;
	offset?: number;
	search?: string;
}

export interface ListTargetsResult {
	rows: CrawlTargetRow[];
	total: number;
}

export interface SourceSummary {
	source: string;
	total: number;
	pending: number;
	done: number;
	failed: number;
	lastCrawledAt: Date | null;
}

export interface CrawlStore {
	upsertTarget(input: UpsertTargetInput): Promise<UpsertResult>;
	findByHash(source: string, urlHash: Buffer): Promise<CrawlTargetRow | null>;
	markFailed(source: string, urlHash: Buffer, reason: string): Promise<void>;
	markDone(
		source: string,
		urlHash: Buffer,
		contentHash: Buffer | null,
	): Promise<void>;
	listTargets(source: string, opts?: ListTargetsOptions): Promise<ListTargetsResult>;
	summarize(sources: string[]): Promise<SourceSummary[]>;
}
