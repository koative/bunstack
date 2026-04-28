import { SendIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { crawlerApi } from "@/lib/api";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubmitPage() {
	let sources: string[] = [];
	let error: string | null = null;
	try {
		const data = await crawlerApi.sources();
		sources = data.sources.map((s) => s.source);
	} catch (err) {
		error = (err as Error).message;
	}

	return (
		<>
			<PageHeader
				title="Submit URLs"
				description="Manually push URLs into the crawl queue."
			/>
			<section className="p-8">
				{error ? (
					<EmptyState
						icon={<SendIcon />}
						title="Cannot reach crawler engine"
						description={error}
					/>
				) : sources.length === 0 ? (
					<EmptyState
						icon={<SendIcon />}
						title="No crawlers registered"
						description="Register a CrawlerHandler in services/crawler/src/index.ts to enable this form."
					/>
				) : (
					<SubmitForm sources={sources} />
				)}
			</section>
		</>
	);
}
