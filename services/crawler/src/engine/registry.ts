import { HandlerNotFoundError, type CrawlerHandler } from "@eros/crawler-core";

export class HandlerRegistry {
	private readonly handlers = new Map<string, CrawlerHandler>();

	register(handler: CrawlerHandler): void {
		if (this.handlers.has(handler.source)) {
			throw new Error(`handler "${handler.source}" already registered`);
		}
		this.handlers.set(handler.source, handler);
	}

	get(source: string): CrawlerHandler {
		const h = this.handlers.get(source);
		if (!h) throw new HandlerNotFoundError(source);
		return h;
	}

	has(source: string): boolean {
		return this.handlers.has(source);
	}

	list(): CrawlerHandler[] {
		return [...this.handlers.values()];
	}
}
