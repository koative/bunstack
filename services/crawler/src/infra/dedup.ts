import type { Redis } from "ioredis";
import type { DedupStore } from "@eros/crawler-core";

const KEY = (prefix: string) => `${prefix}:seen`;

export class RedisDedup implements DedupStore {
	constructor(
		private readonly redis: Redis,
		private readonly prefix: string,
	) {}

	async has(key: string): Promise<boolean> {
		return (await this.redis.sismember(KEY(this.prefix), key)) === 1;
	}

	async add(key: string): Promise<void> {
		await this.redis.sadd(KEY(this.prefix), key);
	}

	async addMany(keys: string[]): Promise<void> {
		if (keys.length === 0) return;
		await this.redis.sadd(KEY(this.prefix), ...keys);
	}

	async delete(key: string): Promise<void> {
		await this.redis.srem(KEY(this.prefix), key);
	}

	async reset(prefix?: string): Promise<void> {
		await this.redis.del(KEY(prefix ?? this.prefix));
	}
}
