import { Redis } from "ioredis";
import { env } from "../env.ts";

export function createRedis(): Redis {
	return new Redis(env.REDIS_URL, {
		maxRetriesPerRequest: null,
		enableReadyCheck: true,
	});
}
