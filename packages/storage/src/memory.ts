import { BlobNotFoundError, UnsupportedOperationError } from "./errors.ts";
import type { BlobStore } from "./interface.ts";
import { normalizeKey } from "./key.ts";
import type {
	BlobBody,
	BlobMetadata,
	PutOptions,
	PutResult,
	SignOptions,
} from "./types.ts";

interface Entry {
	bytes: Uint8Array;
	contentType?: string;
	cacheControl?: string;
	custom?: Record<string, string>;
	lastModified: Date;
	etag: string;
}

async function bodyToBytes(body: BlobBody): Promise<Uint8Array> {
	if (body instanceof Uint8Array) return body;
	if (body instanceof ArrayBuffer) return new Uint8Array(body);
	if (typeof body === "string") return new TextEncoder().encode(body);
	if (body instanceof Blob)
		return new Uint8Array(await body.arrayBuffer());
	const reader = body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		chunks.push(value);
		total += value.length;
	}
	const out = new Uint8Array(total);
	let o = 0;
	for (const c of chunks) {
		out.set(c, o);
		o += c.length;
	}
	return out;
}

function fakeEtag(bytes: Uint8Array): string {
	let h = 5381;
	for (let i = 0; i < bytes.length; i++) h = ((h << 5) + h + bytes[i]!) | 0;
	return `"${(h >>> 0).toString(16)}-${bytes.length}"`;
}

export class MemoryBlobStore implements BlobStore {
	readonly driver = "memory";
	private readonly entries = new Map<string, Entry>();

	async put(
		key: string,
		body: BlobBody,
		opts: PutOptions = {},
	): Promise<PutResult> {
		const k = normalizeKey(key);
		const bytes = await bodyToBytes(body);
		const etag = fakeEtag(bytes);
		this.entries.set(k, {
			bytes,
			contentType: opts.contentType,
			cacheControl: opts.cacheControl,
			custom: opts.custom,
			lastModified: new Date(),
			etag,
		});
		return { key: k, etag, size: bytes.length };
	}

	async get(key: string): Promise<Uint8Array> {
		const k = normalizeKey(key);
		const entry = this.entries.get(k);
		if (!entry) throw new BlobNotFoundError(k);
		return entry.bytes;
	}

	async getStream(key: string): Promise<ReadableStream<Uint8Array>> {
		const bytes = await this.get(key);
		return new ReadableStream({
			start(controller) {
				controller.enqueue(bytes);
				controller.close();
			},
		});
	}

	async head(key: string): Promise<BlobMetadata | null> {
		const k = normalizeKey(key);
		const entry = this.entries.get(k);
		if (!entry) return null;
		return {
			contentType: entry.contentType,
			contentLength: entry.bytes.length,
			etag: entry.etag,
			lastModified: entry.lastModified,
			custom: entry.custom,
		};
	}

	async exists(key: string): Promise<boolean> {
		return this.entries.has(normalizeKey(key));
	}

	async delete(key: string): Promise<void> {
		this.entries.delete(normalizeKey(key));
	}

	async signedUrl(_key: string, _opts: SignOptions = {}): Promise<string> {
		throw new UnsupportedOperationError("signedUrl", this.driver);
	}

	get size(): number {
		return this.entries.size;
	}

	clear(): void {
		this.entries.clear();
	}
}
