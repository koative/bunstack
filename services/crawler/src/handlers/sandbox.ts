import { type CrawlerHandler, sha256 } from "@eros/crawler-core";

interface SandboxData {
	status: number;
	bytes: number;
	contentType: string;
	title: string | null;
}

const TITLE_RE = /<title[^>]*>([^<]*)<\/title>/i;

export const sandboxCrawler: CrawlerHandler<SandboxData> = {
	source: "sandbox",
	config: {
		concurrency: 2,
		rateLimit: { perMinute: 60 },
		retries: 3,
		timeoutMs: 15_000,
		recrawlIntervalSec: 3600,
	},
	async handle({ request, fetch, log }) {
		const res = await fetch.fetch(request.url);
		const body = await res.text();
		const data: SandboxData = {
			status: res.status,
			bytes: body.length,
			contentType: res.headers.get("content-type") ?? "",
			title: TITLE_RE.exec(body)?.[1]?.trim() ?? null,
		};
		log.info("fetched", { url: request.url, ...data });
		return { data, contentHash: sha256(body) };
	},
};
