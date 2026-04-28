import {
	BlockedError,
	type Fetcher,
	type FetchOptions,
	type FetchResponse,
	FetchError,
	TimeoutError,
} from "@eros/crawler-core";

const DEFAULT_TIMEOUT = 30_000;

const DEFAULT_HEADERS: Record<string, string> = {
	"user-agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
	accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"accept-language": "en-US,en;q=0.9",
};

export class HttpFetcher implements Fetcher {
	async fetch(url: string, opts: FetchOptions = {}): Promise<FetchResponse> {
		const ctrl = new AbortController();
		const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
		const timer = setTimeout(() => ctrl.abort(new TimeoutError()), timeoutMs);
		const linkedSignal = link(ctrl.signal, opts.signal);

		try {
			const init: RequestInit & { proxy?: string } = {
				method: opts.method ?? "GET",
				headers: { ...DEFAULT_HEADERS, ...opts.headers },
				body: opts.body ?? undefined,
				redirect: opts.redirect ?? "follow",
				signal: linkedSignal,
			};
			if (opts.proxy?.url) init.proxy = opts.proxy.url;
			const res = await fetch(url, init);

			if (res.status === 429 || res.status === 403 || res.status === 503) {
				throw new BlockedError(`status ${res.status}`);
			}
			if (!res.ok && res.status >= 500) {
				throw new FetchError(`upstream ${res.status}`, {
					status: res.status,
					retryable: true,
				});
			}

			return wrap(res);
		} catch (err) {
			if (err instanceof TimeoutError || err instanceof BlockedError) throw err;
			if (err instanceof FetchError) throw err;
			if ((err as Error).name === "AbortError") throw new TimeoutError();
			throw new FetchError((err as Error).message, {
				retryable: true,
				cause: err,
			});
		} finally {
			clearTimeout(timer);
		}
	}
}

function wrap(res: Response): FetchResponse {
	return {
		status: res.status,
		url: res.url,
		headers: res.headers,
		text: () => res.text(),
		json: <T>() => res.json() as Promise<T>,
		bytes: async () => new Uint8Array(await res.arrayBuffer()),
	};
}

function link(a: AbortSignal, b?: AbortSignal): AbortSignal {
	if (!b) return a;
	const ctrl = new AbortController();
	const onAbort = () => ctrl.abort();
	a.addEventListener("abort", onAbort, { once: true });
	b.addEventListener("abort", onAbort, { once: true });
	return ctrl.signal;
}
