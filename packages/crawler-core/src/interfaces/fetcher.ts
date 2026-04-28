import type { ProxyDescriptor } from "../types.ts";

export type FetchBody = string | Uint8Array | ArrayBuffer | FormData | URLSearchParams | null;

export interface FetchOptions {
	method?: "GET" | "POST" | "HEAD";
	headers?: Record<string, string>;
	body?: FetchBody;
	proxy?: ProxyDescriptor;
	timeoutMs?: number;
	signal?: AbortSignal;
	redirect?: "follow" | "manual" | "error";
}

export interface FetchResponse {
	status: number;
	url: string;
	headers: Headers;
	text(): Promise<string>;
	json<T = unknown>(): Promise<T>;
	bytes(): Promise<Uint8Array>;
}

export interface Fetcher {
	fetch(url: string, opts?: FetchOptions): Promise<FetchResponse>;
}
