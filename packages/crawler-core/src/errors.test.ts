import { describe, expect, it } from "bun:test";
import {
	BlockedError,
	classifyError,
	FetchError,
	HandlerNotFoundError,
	ParseError,
	TimeoutError,
} from "./errors.ts";

describe("classifyError", () => {
	it("classifies typed crawl errors", () => {
		expect(classifyError(new BlockedError())).toBe("blocked");
		expect(classifyError(new TimeoutError())).toBe("timeout");
		expect(classifyError(new ParseError("nope"))).toBe("parse");
		expect(classifyError(new FetchError("dead"))).toBe("fetch");
		expect(classifyError(new HandlerNotFoundError("x"))).toBe("handler");
	});

	it("falls back to unknown for plain Error", () => {
		expect(classifyError(new Error("nope"))).toBe("unknown");
	});

	it("treats AbortError name as timeout", () => {
		const err = new Error("aborted");
		err.name = "AbortError";
		expect(classifyError(err)).toBe("timeout");
	});
});

describe("FetchError", () => {
	it("is retryable by default", () => {
		expect(new FetchError("x").retryable).toBe(true);
	});
	it("preserves status", () => {
		expect(new FetchError("x", { status: 503 }).status).toBe(503);
	});
});

describe("ParseError", () => {
	it("is non-retryable", () => {
		expect(new ParseError("bad").retryable).toBe(false);
	});
});
