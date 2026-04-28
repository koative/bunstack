import type { JobStatus, QueueJob } from "../types.ts";

export interface QueueAdapter {
	enqueue(job: QueueJob): Promise<string>;
	enqueueMany(jobs: QueueJob[]): Promise<string[]>;
	cancel(source: string, jobId: string): Promise<boolean>;
	status(source: string, jobId: string): Promise<JobStatus>;
	stats(source: string): Promise<QueueStats>;
	close(): Promise<void>;
}

export interface QueueStats {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
	delayed: number;
}
