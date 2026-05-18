import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { BlobNotFoundError, UnsupportedOperationError } from "./errors.ts";
import { MemoryBlobStore } from "./memory.ts";

describe("MemoryBlobStore", () => {
	let store: MemoryBlobStore;
	beforeEach(() => {
		store = new MemoryBlobStore();
	});
	afterEach(() => store.clear());

	it("put then get returns same bytes", async () => {
		const bytes = new TextEncoder().encode("hello world");
		await store.put("a/b.txt", bytes, { contentType: "text/plain" });
		const back = await store.get("a/b.txt");
		expect(new TextDecoder().decode(back)).toBe("hello world");
	});

	it("put then head returns metadata", async () => {
		await store.put("img.bin", new Uint8Array([1, 2, 3]), {
			contentType: "application/octet-stream",
		});
		const meta = await store.head("img.bin");
		expect(meta?.contentLength).toBe(3);
		expect(meta?.contentType).toBe("application/octet-stream");
		expect(meta?.etag).toMatch(/^"[0-9a-f]+-3"$/);
	});

	it("get on missing key throws BlobNotFoundError", async () => {
		await expect(store.get("nope")).rejects.toBeInstanceOf(BlobNotFoundError);
	});

	it("exists reports correctly", async () => {
		expect(await store.exists("k")).toBe(false);
		await store.put("k", new Uint8Array([1]));
		expect(await store.exists("k")).toBe(true);
	});

	it("delete removes the entry", async () => {
		await store.put("k", new Uint8Array([1]));
		await store.delete("k");
		expect(await store.exists("k")).toBe(false);
	});

	it("delete is idempotent", async () => {
		await store.delete("never-existed");
	});

	it("getStream produces same bytes", async () => {
		await store.put("k", new TextEncoder().encode("streamed"));
		const stream = await store.getStream("k");
		const reader = stream.getReader();
		const chunks: Uint8Array[] = [];
		for (;;) {
			const { value, done } = await reader.read();
			if (done) break;
			chunks.push(value);
		}
		const merged = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString();
		expect(merged).toBe("streamed");
	});

	it("signedUrl is unsupported", async () => {
		await store.put("k", new Uint8Array([1]));
		await expect(store.signedUrl("k")).rejects.toBeInstanceOf(
			UnsupportedOperationError,
		);
	});

	it("rejects invalid keys", async () => {
		await expect(store.put("../etc/passwd", new Uint8Array([1]))).rejects.toThrow();
	});

	it("put returns size + etag", async () => {
		const r = await store.put("k", new TextEncoder().encode("xy"));
		expect(r.size).toBe(2);
		expect(r.etag).toBeDefined();
	});
});
