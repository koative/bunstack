import type { Metadata } from "next";
import "@eros/ui/globals.css";

import { ThemeProvider } from "@eros/ui/providers/theme-provider";
import { ThemeToggle } from "@eros/ui/theme-toggle";
import { Toaster } from "@eros/ui/sonner";
import { SidebarNav } from "@/components/sidebar-nav";

export const metadata: Metadata = {
	title: "eros admin ❤️‍🔥",
	description: "internal control panel for the eros crawl engine",
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
					<div className="flex min-h-screen">
						<aside className="flex w-60 flex-col border-r bg-card/50">
							<div className="flex h-14 items-center justify-between border-b px-4">
								<span className="font-semibold">eros ❤️‍🔥</span>
								<ThemeToggle />
							</div>
							<SidebarNav />
						</aside>
						<main className="flex-1 overflow-y-auto">{children}</main>
					</div>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
