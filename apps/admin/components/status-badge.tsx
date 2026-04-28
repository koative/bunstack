import { Badge } from "@eros/ui/badge";

const VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	done: "default",
	pending: "secondary",
	failed: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
	return <Badge variant={VARIANT[status] ?? "outline"}>{status}</Badge>;
}
