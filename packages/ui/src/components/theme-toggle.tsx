"use client";

import { useTheme } from "next-themes";
import { Button } from "./button";

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Button
			suppressHydrationWarning
			variant="outline"
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
		>
			{resolvedTheme === "dark" ? "Light" : "Dark"}
		</Button>
	);
}

export { ThemeToggle };
