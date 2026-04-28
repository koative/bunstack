"use client";

import { Button } from "@eros/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
			<h1 className="font-semibold text-2xl">Something went wrong</h1>
			<p className="max-w-xl text-center text-muted-foreground text-sm">
				{error.message}
			</p>
			<Button onClick={reset} variant="outline" size="sm">
				Try again
			</Button>
		</main>
	);
}
