import Link from "next/link";

import { buttonVariants } from "@eros/ui/button";

import { MOCK_CATEGORIES } from "./mock-categories";

export default function Page() {
	return (
		<main className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
			<section className="space-y-2">
				<h1 className="font-bold text-3xl">eros</h1>
				<p className="text-muted-foreground">
					Bun-native monorepo. Try the search and categories in the header.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-semibold text-lg">Categories (mock)</h2>
				<div className="flex flex-col gap-6">
					{MOCK_CATEGORIES.map((group) => (
						<div key={group.label} className="flex flex-col gap-2">
							<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
								{group.label}
							</p>
							<div className="flex flex-wrap gap-2">
								{group.items.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={buttonVariants({
											variant: "outline",
											size: "sm",
										})}
									>
										{item.label}
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
