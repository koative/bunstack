import type {
	ArtifactRecordResult,
	CrawlArtifactInput,
	CrawlArtifactRow,
	CrawlSourceDef,
	CrawlSourceRow,
	CrawlTargetRow,
	ErrorKind,
	StaleTargetQuery,
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

export interface MarkFailedInput {
	source: string;
	urlHash: Buffer;
	reason: string;
	kind: ErrorKind;
	terminal: boolean;
}

export interface MarkDoneInput {
	source: string;
	urlHash: Buffer;
	contentHash: Buffer | null;
	body: unknown;
	bodySize?: number;
	nextCrawlAfter?: Date | null;
}

export interface CrawlStore {
	upsertSource(def: CrawlSourceDef): Promise<void>;
	listSources(): Promise<CrawlSourceRow[]>;

	upsertTarget(input: UpsertTargetInput): Promise<UpsertResult>;
	findByHash(source: string, urlHash: Buffer): Promise<CrawlTargetRow | null>;

	markFailed(input: MarkFailedInput): Promise<void>;
	markDone(input: MarkDoneInput): Promise<ArtifactRecordResult>;

	recordArtifact(input: CrawlArtifactInput): Promise<ArtifactRecordResult>;
	latestArtifact(targetId: string): Promise<CrawlArtifactRow | null>;

	listTargets(source: string, opts?: ListTargetsOptions): Promise<ListTargetsResult>;
	summarize(sources: string[]): Promise<SourceSummary[]>;
	findStaleTargets(opts: StaleTargetQuery): Promise<CrawlTargetRow[]>;
}
