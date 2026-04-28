const TRACKING_PARAM_PATTERN = /^(utm_|fbclid$|gclid$|mc_(eid|cid)$|_ga$|ref$|ref_)/i;

export interface NormalizeOptions {
	dropTrailingSlash?: boolean;
	dropWww?: boolean;
	dropFragment?: boolean;
	dropTrackingParams?: boolean;
	sortQuery?: boolean;
	allowedQueryParams?: ReadonlyArray<string>;
}

const DEFAULTS: Required<Omit<NormalizeOptions, "allowedQueryParams">> = {
	dropTrailingSlash: true,
	dropWww: true,
	dropFragment: true,
	dropTrackingParams: true,
	sortQuery: true,
};

export function normalizeUrl(input: string, opts: NormalizeOptions = {}): string {
	const cfg = { ...DEFAULTS, ...opts };
	const u = new URL(input);

	u.hostname = u.hostname.toLowerCase();
	if (cfg.dropWww) u.hostname = u.hostname.replace(/^www\./, "");
	if (cfg.dropFragment) u.hash = "";

	if (cfg.dropTrackingParams) {
		const allow = opts.allowedQueryParams
			? new Set(opts.allowedQueryParams)
			: null;
		for (const key of [...u.searchParams.keys()]) {
			if (allow && !allow.has(key)) {
				u.searchParams.delete(key);
				continue;
			}
			if (TRACKING_PARAM_PATTERN.test(key)) u.searchParams.delete(key);
		}
	}

	if (cfg.sortQuery) {
		const sorted = [...u.searchParams.entries()].sort(([a], [b]) =>
			a.localeCompare(b),
		);
		u.search = "";
		for (const [k, v] of sorted) u.searchParams.append(k, v);
	}

	if (cfg.dropTrailingSlash && u.pathname.length > 1) {
		u.pathname = u.pathname.replace(/\/+$/, "");
	}

	if ((u.protocol === "http:" && u.port === "80") || (u.protocol === "https:" && u.port === "443")) {
		u.port = "";
	}

	return u.toString();
}
