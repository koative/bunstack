import type {
	CrawlOutcome,
	ProxyDescriptor,
	ProxyProvider,
	ProxyTier,
} from "@eros/crawler-core";

export class NoopProxyProvider implements ProxyProvider {
	async acquire(_tier: ProxyTier): Promise<ProxyDescriptor | null> {
		return null;
	}
	async release(_proxy: ProxyDescriptor, _outcome: CrawlOutcome): Promise<void> {}
}
