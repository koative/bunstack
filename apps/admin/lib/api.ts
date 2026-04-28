const BASE = process.env.CRAWLER_API_URL ?? "http://localhost:1337";

export interface CrawlerHandlerInfo {
	source: string;
	config: {
		concurrency?: number;
		rateLimit?: { perMinute: number };
	} | null;
}

export interface QueueStats {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
	delayed: number;
}

export interface SourceSummary {
	source: string;
	total: number;
	pending: number;
	done: number;
	failed: number;
	lastCrawledAt: string | null;
}

export interface CrawlTarget {
	id: string;
	source: string;
	url: string;
	urlHash: string;
	contentHash: string | null;
	status: string;
	failCount: number;
	lastError: string | null;
	firstSeenAt: string;
	lastCrawledAt: string | null;
	nextCrawlAfter: string | null;
}

export interface OverviewResponse {
	summary: SourceSummary[];
	stats: ({ source: string } & QueueStats)[];
}

export interface ListTargetsResponse {
	rows: CrawlTarget[];
	total: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
		cache: "no-store",
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`${res.status} ${path}: ${body}`);
	}
	return (await res.json()) as T;
}

export const crawlerApi = {
	sources: () => api<{ sources: CrawlerHandlerInfo[] }>("/sources"),
	overview: () => api<OverviewResponse>("/summary"),
	stats: (source: string) => api<QueueStats>(`/stats/${source}`),
	targets: (
		source: string,
		params: { status?: string; search?: string; limit?: number; offset?: number } = {},
	) => {
		const qs = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) {
			if (v != null && v !== "") qs.set(k, String(v));
		}
		const suffix = qs.toString() ? `?${qs}` : "";
		return api<ListTargetsResponse>(`/targets/${source}${suffix}`);
	},
	submitJob: (source: string, urls: string[]) =>
		api<{ accepted: number; skipped: number; jobIds: string[] }>("/jobs", {
			method: "POST",
			body: JSON.stringify({
				source,
				items: urls.map((url) => ({ url })),
			}),
		}),
	cancelJob: (source: string, id: string) =>
		api<{ cancelled: boolean }>(`/jobs/${source}/${id}`, { method: "DELETE" }),
};
