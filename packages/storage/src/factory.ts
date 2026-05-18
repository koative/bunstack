import { z } from "zod";
import { StorageError } from "./errors.ts";
import type { BlobStore } from "./interface.ts";
import { LocalFsBlobStore } from "./local-fs.ts";
import { MemoryBlobStore } from "./memory.ts";
import { S3BlobStore } from "./s3.ts";

export type StorageDriver = "s3" | "local" | "memory";

const EnvSchema = z.object({
	STORAGE_DRIVER: z.enum(["s3", "local", "memory"]).default("local"),

	S3_ENDPOINT: z.string().url().optional(),
	S3_REGION: z.string().default("us-east-1"),
	S3_BUCKET: z.string().optional(),
	S3_ACCESS_KEY_ID: z.string().optional(),
	S3_SECRET_ACCESS_KEY: z.string().optional(),
	S3_VIRTUAL_HOSTED_STYLE: z
		.preprocess((v) => v === "true" || v === "1", z.boolean())
		.default(false),

	STORAGE_LOCAL_ROOT: z.string().default("./.data/blobs"),
});

export type StorageEnv = z.infer<typeof EnvSchema>;

export function loadStorageEnv(env: NodeJS.ProcessEnv = process.env): StorageEnv {
	return EnvSchema.parse(env);
}

export function createBlobStore(env: StorageEnv): BlobStore {
	switch (env.STORAGE_DRIVER) {
		case "memory":
			return new MemoryBlobStore();

		case "local":
			return new LocalFsBlobStore({ root: env.STORAGE_LOCAL_ROOT });

		case "s3": {
			const required = {
				S3_ENDPOINT: env.S3_ENDPOINT,
				S3_BUCKET: env.S3_BUCKET,
				S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID,
				S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY,
			};
			const missing = Object.entries(required)
				.filter(([, v]) => !v)
				.map(([k]) => k);
			if (missing.length > 0) {
				throw new StorageError(
					`STORAGE_DRIVER=s3 requires: ${missing.join(", ")}`,
				);
			}
			return new S3BlobStore({
				endpoint: env.S3_ENDPOINT!,
				region: env.S3_REGION,
				bucket: env.S3_BUCKET!,
				accessKeyId: env.S3_ACCESS_KEY_ID!,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
				virtualHostedStyle: env.S3_VIRTUAL_HOSTED_STYLE,
			});
		}
	}
}
