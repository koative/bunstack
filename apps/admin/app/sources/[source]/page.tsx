import Link from "next/link";
import { ArrowLeftIcon, DatabaseIcon } from "lucide-react";
import { Button, buttonVariants } from "@eros/ui/button";
import { cn } from "@eros/ui/utils";
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
import { StatusBadge } from "@/components/status-badge";
import { crawlerApi } from "@/lib/api";
import { formatRelative, shortHash } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
	params: Promise<{ source: string }>;
	searchParams: Promise<{
		status?: string;
		search?: string;
		offset?: string;
	}>;
}

const PAGE_SIZE = 50;

export default async function SourceDetailPage({ params, searchParams }: PageProps) {
	const { source } = await params;
	const sp = await searchParams;
	const offset = Number.parseInt(sp.offset ?? "0", 10) || 0;

	let stats: Awaited<ReturnType<typeof crawlerApi.stats>> | null = null;
	let targets: Awaited<ReturnType<typeof crawlerApi.targets>> | null = null;
	let error: string | null = null;

	try {
		[stats, targets] = await Promise.all([
			crawlerApi.stats(source),
			crawlerApi.targets(source, {
				status: sp.status,
				search: sp.search,
				limit: PAGE_SIZE,
				offset,
			}),
		]);
	} catch (err) {
		error = (err as Error).message;
	}

	const total = targets?.total ?? 0;
	const showingTo = Math.min(offset + PAGE_SIZE, total);
	const hasPrev = offset > 0;
	const hasNext = offset + PAGE_SIZE < total;
	const buildHref = (newOffset: number) => {
		const qs = new URLSearchParams();
		if (sp.status) qs.set("status", sp.status);
		if (sp.search) qs.set("search", sp.search);
		if (newOffset > 0) qs.set("offset", String(newOffset));
		const s = qs.toString();
		return `/sources/${source}${s ? `?${s}` : ""}`;
	};

	return (
		<>
			<PageHeader
				title={source}
				description={
					stats
						? `active ${stats.active} · waiting ${stats.waiting} · failed ${stats.failed} · completed ${stats.completed}`
						: "—"
				}
				actions={
					<Link
						href="/"
						className={buttonVariants({ variant: "ghost", size: "sm" })}
					>
						<ArrowLeftIcon /> Back
					</Link>
				}
			/>
			<section className="flex flex-col gap-4 p-8">
				<form className="flex flex-wrap items-center gap-2" action={`/sources/${source}`}>
					<input
						name="search"
						defaultValue={sp.search ?? ""}
						placeholder="search url..."
						className="h-9 w-64 rounded-md border bg-background px-3 text-sm"
					/>
					<select
						name="status"
						defaultValue={sp.status ?? ""}
						className="h-9 rounded-md border bg-background px-3 text-sm"
					>
						<option value="">all statuses</option>
						<option value="pending">pending</option>
						<option value="done">done</option>
						<option value="failed">failed</option>
					</select>
					<Button type="submit" size="sm" variant="outline">
						Filter
					</Button>
				</form>

				{error ? (
					<EmptyState
						icon={<DatabaseIcon />}
						title="Cannot load targets"
						description={error}
					/>
				) : !targets || targets.rows.length === 0 ? (
					<EmptyState
						icon={<DatabaseIcon />}
						title="No targets yet"
						description="Submit URLs from the Submit page to populate this table."
					/>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[24px]">#</TableHead>
										<TableHead>URL</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Fails</TableHead>
										<TableHead>Last crawl</TableHead>
										<TableHead>Hash</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{targets.rows.map((t, i) => (
										<TableRow key={t.id}>
											<TableCell className="text-muted-foreground">
												{offset + i + 1}
											</TableCell>
											<TableCell className="max-w-[480px] truncate font-mono text-xs">
												{t.url}
											</TableCell>
											<TableCell>
												<StatusBadge status={t.status} />
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{t.failCount}
											</TableCell>
											<TableCell className="text-muted-foreground text-xs">
												{formatRelative(t.lastCrawledAt)}
											</TableCell>
											<TableCell className="font-mono text-muted-foreground text-xs">
												{shortHash(t.contentHash)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex items-center justify-between text-muted-foreground text-sm">
							<span>
								{offset + 1}–{showingTo} of {total}
							</span>
							<div className="flex gap-2">
								<Link
									href={buildHref(Math.max(0, offset - PAGE_SIZE))}
									aria-disabled={!hasPrev}
									className={cn(
										buttonVariants({ variant: "outline", size: "sm" }),
										!hasPrev && "pointer-events-none opacity-50",
									)}
								>
									Prev
								</Link>
								<Link
									href={buildHref(offset + PAGE_SIZE)}
									aria-disabled={!hasNext}
									className={cn(
										buttonVariants({ variant: "outline", size: "sm" }),
										!hasNext && "pointer-events-none opacity-50",
									)}
								>
									Next
								</Link>
							</div>
						</div>
					</>
				)}
			</section>
		</>
	);
}
