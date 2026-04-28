import type { CrawlOutcome, ProxyDescriptor, ProxyTier } from "../types.ts";

export interface ProxyProvider {
	acquire(tier: ProxyTier, sessionKey?: string): Promise<ProxyDescriptor | null>;
	release(proxy: ProxyDescriptor, outcome: CrawlOutcome): Promise<void>;
}
