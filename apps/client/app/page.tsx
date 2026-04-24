"use client";

import { Button } from "@arc/ui/button";
import { ThemeToggle } from "@arc/ui/theme-toggle";

export default function Page() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			<Button>Hello from arcstack</Button>
			<ThemeToggle />
		</main>
	);
}
