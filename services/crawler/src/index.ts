import { serve } from "bun";
import { env } from "./env.ts";
import { buildEngine } from "./engine/composition.ts";
import { createApi } from "./api/server.ts";

const engine = buildEngine();

// register handlers here as they are implemented:
// engine.registry.register(bunkrCrawler);

engine.workers.start();

const app = createApi({
	registry: engine.registry,
	submitter: engine.submitter,
	queue: engine.queue,
	store: engine.store,
});

const server = serve({
	port: env.PORT,
	fetch: app.fetch,
	hostname: "0.0.0.0",
});

engine.log.info("crawler engine ready", {
	port: server.port,
	sources: engine.registry.list().map((h) => h.source),
});

const shutdown = async (sig: string) => {
	engine.log.info("shutdown initiated", { sig });
	server.stop();
	await engine.workers.stop();
	await engine.queue.close();
	engine.redis.disconnect();
	process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
