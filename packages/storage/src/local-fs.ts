import { mkdir, rm, stat as fsStat } from "node:fs/promises";
import { dirname, join, resolve as resolvePath } from "node:path";
import { BlobNotFoundError, StorageError, UnsupportedOperationError } from "./errors.ts";
import type { BlobStore } from "./interface.ts";
import { normalizeKey } from "./key.ts";
import type {
	BlobBody,
	BlobMetadata,
	PutOptions,
	PutResult,
	SignOptions,
} from "./types.ts";

export interface LocalFsConfig {
	root: string;
}

export class LocalFsBlobStore implements BlobStore {
	readonly driver = "local-fs";
	private readonly root: string;

	constructor(cfg: LocalFsConfig) {
		this.root = resolvePath(cfg.root);
	}

	private path(key: string): string {
		const k = normalizeKey(key);
		const abs = resolvePath(join(this.root, k));
		if (!abs.startsWith(this.root + "/") && abs !== this.root) {
			throw new StorageError(`refusing to write outside root: ${k}`);
		}
		return abs;
	}

	async put(
		key: string,
		body: BlobBody,
		_opts: PutOptions = {},
	): Promise<PutResult> {
		const p = this.path(key);
		await mkdir(dirname(p), { recursive: true });
		const file = Bun.file(p);
		const written = await file.write(body as Parameters<typeof file.write>[0]);
		return { key: normalizeKey(key), size: typeof written === "number" ? written : undefined };
	}

	async get(key: string): Promise<Uint8Array> {
		const p = this.path(key);
		const file = Bun.file(p);
		if (!(await file.exists())) throw new BlobNotFoundError(normalizeKey(key));
		return new Uint8Array(await file.arrayBuffer());
	}

	async getStream(key: string): Promise<ReadableStream<Uint8Array>> {
		const p = this.path(key);
		const file = Bun.file(p);
		if (!(await file.exists())) throw new BlobNotFoundError(normalizeKey(key));
		return file.stream();
	}

	async head(key: string): Promise<BlobMetadata | null> {
		const p = this.path(key);
		try {
			const st = await fsStat(p);
			return {
				contentLength: st.size,
				lastModified: st.mtime,
				contentType: Bun.file(p).type,
			};
		} catch {
			return null;
		}
	}

	async exists(key: string): Promise<boolean> {
		return Bun.file(this.path(key)).exists();
	}

	async delete(key: string): Promise<void> {
		const p = this.path(key);
		await rm(p, { force: true });
	}

	async signedUrl(_key: string, _opts: SignOptions = {}): Promise<string> {
		throw new UnsupportedOperationError("signedUrl", this.driver);
	}
}
