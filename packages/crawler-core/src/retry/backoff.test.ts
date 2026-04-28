import { describe, expect, it } from "bun:test";
import { exponentialBackoff } from "./backoff.ts";

describe("exponentialBackoff", () => {
	it("never returns negative", () => {
		for (let i = 0; i < 50; i++) {
			expect(
				exponentialBackoff(i, { baseMs: 100, factor: 2, jitter: 0.5 }),
			).toBeGreaterThanOrEqual(0);
		}
	});

	it("respects maxMs cap (with jitter band)", () => {
		const max = 1_000;
		for (let i = 0; i < 50; i++) {
			const v = exponentialBackoff(20, {
				baseMs: 100,
				maxMs: max,
				factor: 2,
				jitter: 0.2,
			});
			expect(v).toBeLessThanOrEqual(max * 1.2);
		}
	});

	it("grows with attempt count on average", () => {
		const sample = (attempt: number) =>
			Array.from({ length: 30 }, () =>
				exponentialBackoff(attempt, { baseMs: 100, factor: 2, jitter: 0.05 }),
			).reduce((s, n) => s + n, 0) / 30;
		expect(sample(3)).toBeGreaterThan(sample(1));
	});

	it("jitter=0 yields deterministic exp curve", () => {
		const a = exponentialBackoff(3, {
			baseMs: 100,
			factor: 2,
			jitter: 0,
			maxMs: 10_000,
		});
		const b = exponentialBackoff(3, {
			baseMs: 100,
			factor: 2,
			jitter: 0,
			maxMs: 10_000,
		});
		expect(a).toBe(b);
		expect(a).toBe(400);
	});
});
