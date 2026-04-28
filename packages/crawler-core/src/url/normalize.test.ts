import { describe, expect, it } from "bun:test";
import { normalizeUrl } from "./normalize.ts";

describe("normalizeUrl", () => {
	it("lowercases hostname and strips www", () => {
		expect(normalizeUrl("https://WWW.Example.COM/Foo")).toBe(
			"https://example.com/Foo",
		);
	});

	it("drops fragment and trailing slash", () => {
		expect(normalizeUrl("https://example.com/path/#anchor")).toBe(
			"https://example.com/path",
		);
	});

	it("keeps root slash", () => {
		expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
	});

	it("strips known tracking params", () => {
		expect(
			normalizeUrl("https://example.com/x?utm_source=tw&fbclid=abc&keep=1"),
		).toBe("https://example.com/x?keep=1");
	});

	it("sorts query params for determinism", () => {
		const a = normalizeUrl("https://example.com/?b=2&a=1");
		const b = normalizeUrl("https://example.com/?a=1&b=2");
		expect(a).toBe(b);
		expect(a).toBe("https://example.com/?a=1&b=2");
	});

	it("drops default ports", () => {
		expect(normalizeUrl("http://example.com:80/x")).toBe("http://example.com/x");
		expect(normalizeUrl("https://example.com:443/")).toBe(
			"https://example.com/",
		);
	});

	it("respects allowedQueryParams allowlist", () => {
		expect(
			normalizeUrl("https://example.com/?a=1&b=2&c=3", {
				allowedQueryParams: ["a"],
			}),
		).toBe("https://example.com/?a=1");
	});

	it("is idempotent", () => {
		const once = normalizeUrl(
			"https://Www.Example.COM:443/path/?utm_id=x&z=2&a=1#hash",
		);
		expect(normalizeUrl(once)).toBe(once);
	});

	it("returns same string for equivalent urls", () => {
		const inputs = [
			"https://example.com/x?utm_source=a&b=1",
			"https://www.example.com/x/?b=1&utm_source=a",
			"https://EXAMPLE.com/x?b=1#frag",
		];
		const out = new Set(inputs.map((i) => normalizeUrl(i)));
		expect(out.size).toBe(1);
	});
});
