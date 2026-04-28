import { describe, expect, it } from "bun:test";
import { sha256, urlHash } from "./hash.ts";
import { normalizeUrl } from "./normalize.ts";

describe("urlHash", () => {
	it("is deterministic", () => {
		const a = urlHash("https://example.com/");
		const b = urlHash("https://example.com/");
		expect(a.equals(b)).toBe(true);
	});

	it("differs for different inputs", () => {
		const a = urlHash("https://example.com/a");
		const b = urlHash("https://example.com/b");
		expect(a.equals(b)).toBe(false);
	});

	it("matches SHA-256 length", () => {
		expect(urlHash("any").length).toBe(32);
	});

	it("agrees on normalized equivalents", () => {
		const a = urlHash(normalizeUrl("https://www.example.com/x?utm_id=1"));
		const b = urlHash(normalizeUrl("https://example.com/x"));
		expect(a.equals(b)).toBe(true);
	});

	it("sha256 accepts strings and bytes identically", () => {
		const s = sha256("hello");
		const b = sha256(new TextEncoder().encode("hello"));
		expect(s.equals(b)).toBe(true);
	});
});
