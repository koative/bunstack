export type BlobBody = Uint8Array | ArrayBuffer | string | Blob | ReadableStream;

export interface BlobMetadata {
	contentType?: string;
	contentLength?: number;
	etag?: string;
	lastModified?: Date;
	custom?: Record<string, string>;
}

export interface PutOptions {
	contentType?: string;
	cacheControl?: string;
	custom?: Record<string, string>;
}

export interface PutResult {
	key: string;
	etag?: string;
	size?: number;
}

export type SignMethod = "GET" | "PUT" | "HEAD" | "DELETE";

export interface SignOptions {
	expiresInSec?: number;
	method?: SignMethod;
	contentType?: string;
}
