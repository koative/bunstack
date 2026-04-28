import { Queue, type ConnectionOptions } from "bullmq";
import type {
	JobStatus,
	QueueAdapter,
	QueueJob,
	QueueStats,
} from "@eros/crawler-core";
import { env } from "../env.ts";

const STATUS_MAP: Record<string, JobStatus> = {
	waiting: "waiting",
	"waiting-children": "waiting",
	prioritized: "waiting",
	active: "active",
	completed: "completed",
	failed: "failed",
	delayed: "delayed",
};

function queueName(source: string): string {
	return `${env.BULLMQ_PREFIX}:${source}`;
}

export class BullMqQueue implements QueueAdapter {
	private readonly queues = new Map<string, Queue>();

	constructor(private readonly connection: ConnectionOptions) {}

	private getQueue(source: string): Queue {
		const name = queueName(source);
		let q = this.queues.get(source);
		if (!q) {
			q = new Queue(name, {
				connection: this.connection,
				defaultJobOptions: {
					attempts: 5,
					backoff: { type: "exponential", delay: 2_000 },
					removeOnComplete: { age: 60 * 60 * 24, count: 5_000 },
					removeOnFail: { age: 60 * 60 * 24 * 7 },
				},
			});
			this.queues.set(source, q);
		}
		return q;
	}

	async enqueue(job: QueueJob): Promise<string> {
		const q = this.getQueue(job.source);
		const added = await q.add("crawl", job, {
			jobId: job.jobId,
			priority: job.priority,
			delay: job.delayMs,
		});
		return added.id ?? job.jobId;
	}

	async enqueueMany(jobs: QueueJob[]): Promise<string[]> {
		const out: string[] = [];
		const bySource = new Map<string, QueueJob[]>();
		for (const j of jobs) {
			const arr = bySource.get(j.source) ?? [];
			arr.push(j);
			bySource.set(j.source, arr);
		}
		for (const [source, items] of bySource) {
			const q = this.getQueue(source);
			const added = await q.addBulk(
				items.map((j) => ({
					name: "crawl",
					data: j,
					opts: { jobId: j.jobId, priority: j.priority, delay: j.delayMs },
				})),
			);
			out.push(...added.map((a) => a.id ?? ""));
		}
		return out;
	}

	async cancel(source: string, jobId: string): Promise<boolean> {
		const q = this.getQueue(source);
		const job = await q.getJob(jobId);
		if (!job) return false;
		await job.remove();
		return true;
	}

	async status(source: string, jobId: string): Promise<JobStatus> {
		const q = this.getQueue(source);
		const job = await q.getJob(jobId);
		if (!job) return "unknown";
		const state = await job.getState();
		return STATUS_MAP[state] ?? "unknown";
	}

	async stats(source: string): Promise<QueueStats> {
		const q = this.getQueue(source);
		const counts = await q.getJobCounts(
			"waiting",
			"active",
			"completed",
			"failed",
			"delayed",
		);
		return {
			waiting: counts.waiting ?? 0,
			active: counts.active ?? 0,
			completed: counts.completed ?? 0,
			failed: counts.failed ?? 0,
			delayed: counts.delayed ?? 0,
		};
	}

	async close(): Promise<void> {
		await Promise.all([...this.queues.values()].map((q) => q.close()));
		this.queues.clear();
	}
}

export { queueName };
