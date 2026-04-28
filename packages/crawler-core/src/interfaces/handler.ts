import type { Logger } from "../logger/index.ts";
import type {
	CrawlRequest,
	CrawlResult,
	CrawlerConfig,
	EnqueueItem,
} from "../types.ts";
import type { Fetcher } from "./fetcher.ts";
import type { CrawlStore } from "./store.ts";

export interface CrawlContext {
	request: CrawlRequest;
	fetch: Fetcher;
	log: Logger;
	store: CrawlStore;
	enqueue(items: EnqueueItem[]): Promise<void>;
	signal: AbortSignal;
}

export interface CrawlerHandler<TData = unknown> {
	readonly source: string;
	readonly config?: CrawlerConfig;
	handle(ctx: CrawlContext): Promise<CrawlResult<TData>>;
}
