import pino from "pino";
import type { Logger } from "@eros/crawler-core";
import { env } from "../env.ts";

const root = pino({
	level: env.LOG_LEVEL,
	transport:
		env.NODE_ENV === "development"
			? { target: "pino-pretty", options: { colorize: true } }
			: undefined,
});

function adapt(p: pino.Logger): Logger {
	return {
		info: (msg, meta) => p.info(meta ?? {}, msg),
		warn: (msg, meta) => p.warn(meta ?? {}, msg),
		error: (msg, meta) => p.error(meta ?? {}, msg),
		debug: (msg, meta) => p.debug(meta ?? {}, msg),
		child: (bindings) => adapt(p.child(bindings)),
	};
}

export const logger: Logger = adapt(root);
