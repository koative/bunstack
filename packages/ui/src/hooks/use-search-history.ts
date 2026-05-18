"use client";

import { useSyncExternalStore } from "react";

const MAX_ITEMS = 10;

type Store = {
	snapshot: string[] | null;
	listeners: Set<() => void>;
	bound: boolean;
};

const stores = new Map<string, Store>();

function getStore(key: string): Store {
	let store = stores.get(key);
	if (!store) {
		store = { snapshot: null, listeners: new Set(), bound: false };
		stores.set(key, store);
	}
	return store;
}

function readStorage(key: string): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((entry): entry is string => typeof entry === "string");
	} catch {
		return [];
	}
}

function writeStorage(key: string, items: string[]): void {
	if (typeof window === "undefined") return;
	const store = getStore(key);
	const trimmed = items.slice(0, MAX_ITEMS);
	try {
		window.localStorage.setItem(key, JSON.stringify(trimmed));
	} catch {
		// ignore quota
	}
	store.snapshot = trimmed;
	for (const cb of store.listeners) cb();
}

const EMPTY: string[] = [];

export function useSearchHistory(storageKey = "eros-search-history") {
	const subscribe = (callback: () => void): (() => void) => {
		const store = getStore(storageKey);
		store.listeners.add(callback);
		if (!store.bound && typeof window !== "undefined") {
			store.bound = true;
			window.addEventListener("storage", (event: StorageEvent) => {
				if (event.key === storageKey) {
					store.snapshot = readStorage(storageKey);
					for (const cb of store.listeners) cb();
				}
			});
		}
		return () => {
			store.listeners.delete(callback);
		};
	};

	const getSnapshot = (): string[] => {
		const store = getStore(storageKey);
		if (store.snapshot === null) store.snapshot = readStorage(storageKey);
		return store.snapshot;
	};

	const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

	const push = (query: string) => {
		const normalized = query.trim();
		if (!normalized) return;
		const next = [
			normalized,
			...items.filter(
				(entry) => entry.toLowerCase() !== normalized.toLowerCase(),
			),
		];
		writeStorage(storageKey, next);
	};

	const remove = (query: string) => {
		writeStorage(
			storageKey,
			items.filter((entry) => entry !== query),
		);
	};

	const clear = () => {
		writeStorage(storageKey, []);
	};

	return { items, push, remove, clear };
}
