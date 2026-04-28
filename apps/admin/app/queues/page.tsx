import { ActivityIcon } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@eros/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { crawlerApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QueuesPage() {
	let stats:
		| Awaited<ReturnType<typeof crawlerApi.overview>>["stats"]
		| null = null;
	let error: string | null = null;
	try {
		const data = await crawlerApi.overview();
		stats = data.stats;
	} catch (err) {
		error = (err as Error).message;
	}

	return (
		<>
			<PageHeader
				title="Queues"
				description="BullMQ state per source."
			/>
			<section className="p-8">
				{error || !stats || stats.length === 0 ? (
					<EmptyState
						icon={<ActivityIcon />}
						title={error ?? "No queues yet"}
						description={
							error
								? "Engine unreachable — is services/crawler running?"
								: "Queues are created lazily when the first job arrives."
						}
					/>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Source</TableHead>
									<TableHead className="text-right">Active</TableHead>
									<TableHead className="text-right">Waiting</TableHead>
									<TableHead className="text-right">Delayed</TableHead>
									<TableHead className="text-right">Completed</TableHead>
									<TableHead className="text-right">Failed</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{stats.map((s) => (
									<TableRow key={s.source}>
										<TableCell className="font-mono">{s.source}</TableCell>
										<TableCell className="text-right font-mono">
											{s.active}
										</TableCell>
										<TableCell className="text-right font-mono">
											{s.waiting}
										</TableCell>
										<TableCell className="text-right font-mono">
											{s.delayed}
										</TableCell>
										<TableCell className="text-right font-mono">
											{s.completed}
										</TableCell>
										<TableCell className="text-right font-mono text-destructive">
											{s.failed}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</section>
		</>
	);
}
