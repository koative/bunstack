export interface BackoffOptions {
	baseMs?: number;
	maxMs?: number;
	factor?: number;
	jitter?: number;
}

export function exponentialBackoff(
	attempt: number,
	opts: BackoffOptions = {},
): number {
	const { baseMs = 1000, maxMs = 60_000, factor = 2, jitter = 0.2 } = opts;
	const exp = Math.min(maxMs, baseMs * factor ** Math.max(0, attempt - 1));
	const noise = exp * jitter * (Math.random() * 2 - 1);
	return Math.max(0, Math.round(exp + noise));
}
