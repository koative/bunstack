import { describe, expect, it } from "bun:test";
import { joinKey, normalizeKey } from "./key.ts";

describe("normalizeKey", () => {
	it("accepts simple paths", () => {
		expect(normalizeKey("foo/bar.jpg")).toBe("foo/bar.jpg");
		expect(normalizeKey("a/b/c/d.txt")).toBe("a/b/c/d.txt");
	});

	it("rejects empty key", () => {
		expect(() => normalizeKey("")).toThrow();
	});

	it("rejects leading slash", () => {
		expect(() => normalizeKey("/foo")).toThrow();
	});

	it("rejects path traversal", () => {
		expect(() => normalizeKey("foo/../../etc/passwd")).toThrow();
	});

	it("rejects spaces and weird chars", () => {
		expect(() => normalizeKey("foo bar")).toThrow();
		expect(() => normalizeKey("foo;bar")).toThrow();
	});
});

describe("joinKey", () => {
	it("joins parts with single slash", () => {
		expect(joinKey("a", "b", "c")).toBe("a/b/c");
	});

	it("strips edge slashes", () => {
		expect(joinKey("/a/", "/b/", "/c/")).toBe("a/b/c");
	});

	it("skips empty parts", () => {
		expect(joinKey("a", "", "b")).toBe("a/b");
	});
});
