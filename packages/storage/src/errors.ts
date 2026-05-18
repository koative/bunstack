export class StorageError extends Error {
	override readonly name: string = "StorageError";
	override readonly cause?: unknown;
	constructor(message: string, cause?: unknown) {
		super(message);
		this.cause = cause;
	}
}

export class BlobNotFoundError extends StorageError {
	override readonly name = "BlobNotFoundError";
	constructor(public readonly key: string) {
		super(`blob not found: ${key}`);
	}
}

export class UnsupportedOperationError extends StorageError {
	override readonly name = "UnsupportedOperationError";
	constructor(op: string, driver: string) {
		super(`operation "${op}" is not supported by driver "${driver}"`);
	}
}
