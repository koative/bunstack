import { S3Client, type S3Options } from "bun";
import { BlobNotFoundError, StorageError } from "./errors.ts";
import type { BlobStore } from "./interface.ts";
import { normalizeKey } from "./key.ts";
import type {
	BlobBody,
	BlobMetadata,
	PutOptions,
	PutResult,
	SignOptions,
} from "./types.ts";

export interface S3BlobConfig {
	endpoint: string;
	region: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
	virtualHostedStyle?: boolean;
}

export class S3BlobStore implements BlobStore {
	readonly driver = "s3";
	private readonly client: S3Client;
	private readonly bucket: string;

	constructor(cfg: S3BlobConfig) {
		const opts: S3Options = {
			endpoint: cfg.endpoint,
			region: cfg.region,
			bucket: cfg.bucket,
			accessKeyId: cfg.accessKeyId,
			secretAccessKey: cfg.secretAccessKey,
			virtualHostedStyle: cfg.virtualHostedStyle ?? false,
		};
		this.client = new S3Client(opts);
		this.bucket = cfg.bucket;
	}

	async put(
		key: string,
		body: BlobBody,
		opts: PutOptions = {},
	): Promise<PutResult> {
		const k = normalizeKey(key);
		try {
			const file = this.client.file(k, {
				type: opts.contentType,
			});
			const written = await file.write(
				body as Parameters<typeof file.write>[0],
				{ type: opts.contentType, ...metadataHeaders(opts) },
			);
			return { key: k, size: typeof written === "number" ? written : undefined };
		} catch (err) {
			throw new StorageError(`s3 put failed: ${(err as Error).message}`, err);
		}
	}

	async get(key: string): Promise<Uint8Array> {
		const k = normalizeKey(key);
		try {
			const file = this.client.file(k);
			return new Uint8Array(await file.arrayBuffer());
		} catch (err) {
			if (isNotFound(err)) throw new BlobNotFoundError(k);
			throw new StorageError(`s3 get failed: ${(err as Error).message}`, err);
		}
	}

	async getStream(key: string): Promise<ReadableStream<Uint8Array>> {
		const k = normalizeKey(key);
		const file = this.client.file(k);
		return file.stream();
	}

	async head(key: string): Promise<BlobMetadata | null> {
		const k = normalizeKey(key);
		try {
			const file = this.client.file(k);
			const stat = await file.stat();
			return {
				contentType: stat.type,
				contentLength: stat.size,
				etag: stat.etag,
				lastModified: stat.lastModified
					? new Date(stat.lastModified)
					: undefined,
			};
		} catch (err) {
			if (isNotFound(err)) return null;
			throw new StorageError(`s3 head failed: ${(err as Error).message}`, err);
		}
	}

	async exists(key: string): Promise<boolean> {
		const k = normalizeKey(key);
		try {
			return await this.client.file(k).exists();
		} catch (err) {
			throw new StorageError(`s3 exists failed: ${(err as Error).message}`, err);
		}
	}

	async delete(key: string): Promise<void> {
		const k = normalizeKey(key);
		try {
			await this.client.file(k).delete();
		} catch (err) {
			if (isNotFound(err)) return;
			throw new StorageError(`s3 delete failed: ${(err as Error).message}`, err);
		}
	}

	async signedUrl(key: string, opts: SignOptions = {}): Promise<string> {
		const k = normalizeKey(key);
		try {
			return this.client.presign(k, {
				expiresIn: opts.expiresInSec ?? 3600,
				method: opts.method ?? "GET",
				type: opts.contentType,
			});
		} catch (err) {
			throw new StorageError(`s3 sign failed: ${(err as Error).message}`, err);
		}
	}
}

function metadataHeaders(opts: PutOptions): Record<string, string> {
	const headers: Record<string, string> = {};
	if (opts.cacheControl) headers["cache-control"] = opts.cacheControl;
	if (opts.custom) {
		for (const [k, v] of Object.entries(opts.custom)) {
			headers[`x-amz-meta-${k.toLowerCase()}`] = v;
		}
	}
	return headers;
}

function isNotFound(err: unknown): boolean {
	const message = (err as Error)?.message?.toLowerCase() ?? "";
	return (
		message.includes("nosuchkey") ||
		message.includes("not found") ||
		message.includes("404")
	);
}
