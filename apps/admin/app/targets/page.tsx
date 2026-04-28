import Link from "next/link";
import { DatabaseIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@eros/ui/card";
import { buttonVariants } from "@eros/ui/button";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { crawlerApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TargetsIndexPage() {
	let sources: Awaited<ReturnType<typeof crawlerApi.sources>>["sources"] = [];
	let error: string | null = null;
	try {
		sources = (await crawlerApi.sources()).sources;
	} catch (err) {
		error = (err as Error).message;
	}

	return (
		<>
			<PageHeader
				title="Targets"
				description="Pick a source to browse its crawl_targets table."
			/>
			<section className="p-8">
				{error || sources.length === 0 ? (
					<EmptyState
						icon={<DatabaseIcon />}
						title={error ?? "No sources to browse"}
						description={
							error
								? "Engine unreachable."
								: "Register a crawler first, then submit URLs to populate the table."
						}
					/>
				) : (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{sources.map((s) => (
							<Card key={s.source}>
								<CardHeader>
									<CardTitle className="font-mono text-base">{s.source}</CardTitle>
								</CardHeader>
								<CardContent>
									<Link
										href={`/sources/${s.source}`}
										className={buttonVariants({ variant: "outline", size: "sm" })}
									>
										open →
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</section>
		</>
	);
}
