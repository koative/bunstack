import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { z } from "zod";
import type { JobSubmitter } from "../engine/submit.ts";
import type { HandlerRegistry } from "../engine/registry.ts";
import type { CrawlStore, QueueAdapter } from "@eros/crawler-core";

const SubmitSchema = z.object({
	source: z.string().min(1),
	items: z
		.array(
			z.object({
				url: z.string().url(),
				priority: z.number().int().min(0).max(10).optional(),
				delayMs: z.number().int().nonnegative().optional(),
				metadata: z.record(z.unknown()).optional(),
			}),
		)
		.min(1)
		.max(1000),
});

const ListTargetsSchema = z.object({
	status: z.enum(["pending", "done", "failed"]).optional(),
	search: z.string().optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().nonnegative().default(0),
});

export interface ApiDeps {
	registry: HandlerRegistry;
	submitter: JobSubmitter;
	queue: QueueAdapter;
	store: CrawlStore;
}

export function createApi(deps: ApiDeps): Hono {
	const app = new Hono();

	app.use("*", honoLogger());
	app.use("*", cors({ origin: "*" }));

	app.get("/health", (c) => c.json({ ok: true }));

	app.get("/summary", async (c) => {
		const sources = deps.registry.list().map((h) => h.source);
		const summary = await deps.store.summarize(sources);
		const stats = await Promise.all(
			sources.map(async (s) => ({ source: s, ...(await deps.queue.stats(s)) })),
		);
		return c.json({ summary, stats });
	});

	app.get("/sources", (c) =>
		c.json({
			sources: deps.registry.list().map((h) => ({
				source: h.source,
				config: h.config ?? null,
			})),
		}),
	);

	app.post("/jobs", async (c) => {
		const body = await c.req.json().catch(() => null);
		const parsed = SubmitSchema.safeParse(body);
		if (!parsed.success) {
			return c.json({ error: parsed.error.flatten() }, 400);
		}
		try {
			const result = await deps.submitter.submit(parsed.data);
			return c.json(result, 202);
		} catch (err) {
			return c.json({ error: (err as Error).message }, 400);
		}
	});

	app.get("/jobs/:source/:id/status", async (c) => {
		const status = await deps.queue.status(c.req.param("source"), c.req.param("id"));
		return c.json({ status });
	});

	app.delete("/jobs/:source/:id", async (c) => {
		const ok = await deps.queue.cancel(c.req.param("source"), c.req.param("id"));
		return c.json({ cancelled: ok });
	});

	app.get("/stats/:source", async (c) => {
		const stats = await deps.queue.stats(c.req.param("source"));
		return c.json(stats);
	});

	app.get("/targets/:source", async (c) => {
		const source = c.req.param("source");
		if (!deps.registry.has(source)) return c.json({ error: "unknown_source" }, 404);
		const parsed = ListTargetsSchema.safeParse(
			Object.fromEntries(new URL(c.req.url).searchParams),
		);
		if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
		const result = await deps.store.listTargets(source, parsed.data);
		return c.json({
			...result,
			rows: result.rows.map(serializeTarget),
		});
	});

	app.notFound((c) => c.json({ error: "not_found" }, 404));
	app.onError((err, c) => {
		console.error(err);
		return c.json({ error: err.message }, 500);
	});

	return app;
}

function serializeTarget(row: {
	id: string;
	source: string;
	url: string;
	urlHash: Buffer;
	contentHash: Buffer | null;
	status: string;
	failCount: number;
	lastError?: string | null;
	firstSeenAt: Date;
	lastCrawledAt: Date | null;
	nextCrawlAfter: Date | null;
}) {
	return {
		id: row.id,
		source: row.source,
		url: row.url,
		urlHash: row.urlHash.toString("hex"),
		contentHash: row.contentHash?.toString("hex") ?? null,
		status: row.status,
		failCount: row.failCount,
		lastError: row.lastError ?? null,
		firstSeenAt: row.firstSeenAt.toISOString(),
		lastCrawledAt: row.lastCrawledAt?.toISOString() ?? null,
		nextCrawlAfter: row.nextCrawlAfter?.toISOString() ?? null,
	};
}
