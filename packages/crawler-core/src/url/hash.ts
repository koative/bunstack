import { createHash } from "node:crypto";

export function sha256(input: string | Uint8Array): Buffer {
	return createHash("sha256").update(input).digest();
}

export function urlHash(normalized: string): Buffer {
	return sha256(normalized);
}
