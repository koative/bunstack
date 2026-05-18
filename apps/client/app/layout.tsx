import type { Metadata } from "next";
import { Suspense } from "react";
import "@eros/ui/globals.css";

import { ThemeProvider } from "@eros/ui/providers/theme-provider";

import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
	title: "eros ❤️‍🔥",
	description: "Bun-native monorepo",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<Suspense fallback={null}>
						<SiteHeader />
					</Suspense>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
