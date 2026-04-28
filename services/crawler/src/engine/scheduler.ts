import type { CrawlStore, Logger } from "@eros/crawler-core";
import type { JobSubmitter } from "./submit.ts";

export interface SchedulerOptions {
	intervalMs?: number;
	batchSize?: number;
}

export class RecrawlScheduler {
	private timer: ReturnType<typeof setInterval> | null = null;
	private running = false;

	constructor(
		private readonly store: CrawlStore,
		private readonly submitter: JobSubmitter,
		private readonly log: Logger,
		private readonly opts: SchedulerOptions = {},
	) {}

	start(): void {
		const interval = this.opts.intervalMs ?? 60_000;
		this.timer = setInterval(() => void this.tick(), interval);
		this.log.info("recrawl scheduler started", { intervalMs: interval });
	}

	stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	private async tick(): Promise<void> {
		if (this.running) return;
		this.running = true;
		try {
			const stale = await this.store.findStaleTargets({
				limit: this.opts.batchSize ?? 200,
			});
			if (stale.length === 0) return;

			const bySource = new Map<string, { url: string }[]>();
			for (const target of stale) {
				const arr = bySource.get(target.source) ?? [];
				arr.push({ url: target.url });
				bySource.set(target.source, arr);
			}

			let total = 0;
			for (const [source, items] of bySource) {
				try {
					const result = await this.submitter.submit({ source, items });
					total += result.accepted;
				} catch (err) {
					this.log.warn("recrawl source failed", {
						source,
						err: (err as Error).message,
					});
				}
			}

			if (total > 0) {
				this.log.info("recrawl batch enqueued", { total });
			}
		} catch (err) {
			this.log.error("recrawl tick failed", {
				err: (err as Error).message,
			});
		} finally {
			this.running = false;
		}
	}
}
