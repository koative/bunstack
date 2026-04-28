export interface DedupStore {
	has(key: string): Promise<boolean>;
	add(key: string): Promise<void>;
	addMany(keys: string[]): Promise<void>;
	delete(key: string): Promise<void>;
	reset(prefix?: string): Promise<void>;
}
