export class CrawlError extends Error {
	override readonly name: string = "CrawlError";
	readonly retryable: boolean;
	override readonly cause?: unknown;

	constructor(
		message: string,
		options: { retryable?: boolean; cause?: unknown } = {},
	) {
		super(message);
		this.retryable = options.retryable ?? false;
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
		super(message, { retryable: options.retryable ?? true, cause: options.cause });
		this.status = options.status;
	}
}

export class BlockedError extends CrawlError {
	override readonly name = "BlockedError";
	constructor(message = "request blocked", cause?: unknown) {
		super(message, { retryable: true, cause });
	}
}

export class TimeoutError extends CrawlError {
	override readonly name = "TimeoutError";
	constructor(message = "request timed out", cause?: unknown) {
		super(message, { retryable: true, cause });
	}
}

export class HandlerNotFoundError extends CrawlError {
	override readonly name = "HandlerNotFoundError";
	constructor(source: string) {
		super(`no handler registered for source "${source}"`, { retryable: false });
	}
}

export class ParseError extends CrawlError {
	override readonly name = "ParseError";
	constructor(message: string, cause?: unknown) {
		super(message, { retryable: false, cause });
	}
}
