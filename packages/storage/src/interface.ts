import type {
	BlobBody,
	BlobMetadata,
	PutOptions,
	PutResult,
	SignOptions,
} from "./types.ts";

export interface BlobStore {
	readonly driver: string;

	put(key: string, body: BlobBody, opts?: PutOptions): Promise<PutResult>;
	get(key: string): Promise<Uint8Array>;
	getStream(key: string): Promise<ReadableStream<Uint8Array>>;
	head(key: string): Promise<BlobMetadata | null>;
	exists(key: string): Promise<boolean>;
	delete(key: string): Promise<void>;
	signedUrl(key: string, opts?: SignOptions): Promise<string>;
}
