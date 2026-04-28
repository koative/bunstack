import type { ErrorKind } from "./types.ts";

export class CrawlError extends Error {
	override readonly name: string = "CrawlError";
	readonly retryable: boolean;
	readonly kind: ErrorKind;
	override readonly cause?: unknown;

	constructor(
		message: string,
		options: { retryable?: boolean; kind?: ErrorKind; cause?: unknown } = {},
	) {
		super(message);
		this.retryable = options.retryable ?? false;
		this.kind = options.kind ?? "unknown";
		this.cause = options.cause;
	}
}

export class FetchError extends CrawlError {
	override readonly name = "FetchError";
	readonly status?: number;

	constructor(
		message: string,
		options: { status?: number; retryable?: boolean; cause?: unknown } = {},
	) {
		super(message, {
			retryable: options.retryable ?? true,
			kind: "fetch",
			cause: options.cause,
		});
		this.status = options.status;
	}
}

export class BlockedError extends CrawlError {
	override readonly name = "BlockedError";
	constructor(message = "request blocked", cause?: unknown) {
		super(message, { retryable: true, kind: "blocked", cause });
	}
}

export class TimeoutError extends CrawlError {
	override readonly name = "TimeoutError";
	constructor(message = "request timed out", cause?: unknown) {
		super(message, { retryable: true, kind: "timeout", cause });
	}
}

export class HandlerNotFoundError extends CrawlError {
	override readonly name = "HandlerNotFoundError";
	constructor(source: string) {
		super(`no handler registered for source "${source}"`, {
			retryable: false,
			kind: "handler",
		});
	}
}

export class ParseError extends CrawlError {
	override readonly name = "ParseError";
	constructor(message: string, cause?: unknown) {
		super(message, { retryable: false, kind: "parse", cause });
	}
}

export function classifyError(err: unknown): ErrorKind {
	if (err instanceof CrawlError) return err.kind;
	const e = err as Error | undefined;
	if (e?.name === "AbortError") return "timeout";
	return "unknown";
}
