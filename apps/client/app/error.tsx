"use client";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-2">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<p className="text-muted-foreground">{error.message}</p>
			<button
				type="button"
				className="text-sm underline underline-offset-4"
				onClick={reset}
			>
				Try again
			</button>
		</main>
	);
}
