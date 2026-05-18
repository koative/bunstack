#!/usr/bin/env bun
import { createBlobStore, loadStorageEnv } from "../src/factory.ts";

const env = loadStorageEnv({
	...process.env,
	STORAGE_DRIVER: "s3",
	S3_ENDPOINT: process.env.S3_ENDPOINT ?? "http://localhost:9000",
	S3_BUCKET: process.env.S3_BUCKET ?? "eros",
	S3_REGION: process.env.S3_REGION ?? "us-east-1",
	S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "erosadmin",
	S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "erosadmin123",
});

const store = createBlobStore(env);
const key = `smoke/test-${Date.now()}.txt`;
const payload = new TextEncoder().encode("hello s3!");

console.log("[1] put", key);
const put = await store.put(key, payload, { contentType: "text/plain" });
console.log("    →", put);

console.log("[2] exists");
console.log("    →", await store.exists(key));

console.log("[3] head");
console.log("    →", await store.head(key));

console.log("[4] get");
const back = await store.get(key);
console.log("    → bytes:", back.length, "content:", new TextDecoder().decode(back));

console.log("[5] signedUrl GET (expires 60s)");
const url = await store.signedUrl(key, { expiresInSec: 60 });
console.log("    →", url.replace(/Signature=[^&]+/, "Signature=…"));

const fetched = await fetch(url);
console.log("[6] fetch presigned →", fetched.status, await fetched.text());

console.log("[7] delete");
await store.delete(key);
console.log("    → exists now:", await store.exists(key));

console.log("\n✓ S3 round-trip OK");
