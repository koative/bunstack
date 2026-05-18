const VALID_CHAR = /^[\w./-]+$/;

export function normalizeKey(key: string): string {
	if (!key || key.length === 0) throw new Error("blob key is required");
	if (key.startsWith("/")) {
		throw new Error("blob key must not start with /");
	}
	if (key.includes("..")) {
		throw new Error("blob key must not contain ..");
	}
	if (!VALID_CHAR.test(key)) {
		throw new Error(
			"blob key may only contain letters, digits, _, ., -, /, and slashes",
		);
	}
	return key;
}

export function joinKey(...parts: string[]): string {
	return parts
		.map((p) => p.replace(/^\/+|\/+$/g, ""))
		.filter(Boolean)
		.join("/");
}
