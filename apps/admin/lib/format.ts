export function formatRelative(iso: string | null | undefined): string {
	if (!iso) return "—";
	const date = new Date(iso);
	const diff = (Date.now() - date.getTime()) / 1000;
	if (diff < 60) return `${Math.round(diff)}s ago`;
	if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
	if (diff < 86_400) return `${Math.round(diff / 3600)}h ago`;
	return `${Math.round(diff / 86_400)}d ago`;
}

export function shortHash(hex: string | null): string {
	if (!hex) return "—";
	return `${hex.slice(0, 8)}…`;
}
