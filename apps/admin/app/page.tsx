import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@eros/ui/card";
import { buttonVariants } from "@eros/ui/button";
import { Badge } from "@eros/ui/badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { crawlerApi } from "@/lib/api";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverviewPage() {
	let data: Awaited<ReturnType<typeof crawlerApi.overview>> | null = null;
	let sourcesData: Awaited<ReturnType<typeof crawlerApi.sources>> | null = null;
	let error: string | null = null;
	try {
		[data, sourcesData] = await Promise.all([
			crawlerApi.overview(),
			crawlerApi.sources(),
		]);
	} catch (err) {
		error = (err as Error).message;
	}

	return (
		<>
			<PageHeader
				title="Overview"
				description="Live snapshot of every registered crawler."
				actions={
					<Link
						href="/submit"
						className={buttonVariants({ size: "sm" })}
					>
						Submit URLs
					</Link>
				}
			/>

			<section className="flex flex-col gap-6 p-8">
				{error ? (
					<EmptyState
						icon={<CompassIcon />}
						title="Cannot reach crawler engine"
						description={error}
					/>
				) : !sourcesData || sourcesData.sources.length === 0 ? (
					<EmptyState
						icon={<CompassIcon />}
						title="No crawlers registered yet"
						description="Register a CrawlerHandler in services/crawler/src/index.ts to get started."
					/>
				) : (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{sourcesData.sources.map((s) => {
							const summary = data?.summary.find((x) => x.source === s.source);
							const stats = data?.stats.find((x) => x.source === s.source);
							return (
								<Card key={s.source}>
									<CardHeader className="flex flex-row items-center justify-between">
										<CardTitle className="font-mono text-base">
											{s.source}
										</CardTitle>
										<Badge variant="outline">
											concurrency {s.config?.concurrency ?? "?"}
										</Badge>
									</CardHeader>
									<CardContent className="flex flex-col gap-3">
										<div className="grid grid-cols-3 gap-3 text-sm">
											<Stat label="active" value={stats?.active ?? 0} />
											<Stat label="waiting" value={stats?.waiting ?? 0} />
											<Stat label="failed" value={stats?.failed ?? 0} />
											<Stat label="done" value={summary?.done ?? 0} />
											<Stat label="pending" value={summary?.pending ?? 0} />
											<Stat label="total" value={summary?.total ?? 0} />
										</div>
										<div className="flex items-center justify-between text-muted-foreground text-xs">
											<span>last {formatRelative(summary?.lastCrawledAt ?? null)}</span>
											<Link
												href={`/sources/${s.source}`}
												className="font-medium text-primary text-xs underline-offset-4 hover:underline"
											>
												open →
											</Link>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</section>
		</>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-muted-foreground text-xs uppercase tracking-wide">
				{label}
			</span>
			<span className="font-mono font-semibold text-base">{value}</span>
		</div>
	);
}
