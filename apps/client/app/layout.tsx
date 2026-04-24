import type { Metadata } from "next";
import "@arc/ui/globals.css";

import { ThemeProvider } from "@arc/ui/providers/theme-provider";

export const metadata: Metadata = {
	title: "arcstack",
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
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
