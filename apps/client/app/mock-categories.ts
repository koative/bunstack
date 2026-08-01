import type { CategoryGroup } from "@arc/ui/app-header";

export const MOCK_CATEGORIES: CategoryGroup[] = [
	{
		label: "Discover",
		items: [
			{ label: "Trending", href: "/categories/trending" },
			{ label: "Latest", href: "/categories/latest" },
			{ label: "Popular", href: "/categories/popular" },
			{ label: "Editor's Picks", href: "/categories/editors-picks" },
		],
	},
	{
		label: "Topics",
		items: [
			{ label: "Engineering", href: "/categories/engineering" },
			{ label: "Design", href: "/categories/design" },
			{ label: "Product", href: "/categories/product" },
			{ label: "Research", href: "/categories/research" },
			{ label: "Open Source", href: "/categories/open-source" },
		],
	},
	{
		label: "Format",
		items: [
			{ label: "Articles", href: "/categories/articles" },
			{ label: "Videos", href: "/categories/videos" },
			{ label: "Podcasts", href: "/categories/podcasts" },
			{ label: "Live", href: "/categories/live" },
		],
	},
];

export const SEARCH_PLACEHOLDERS = [
	"Search across the catalog...",
	"Try: design systems, monorepos...",
	"Try: bun, hono, postgres...",
	"Try: crawler, queue, worker...",
];

export const HEADER_EMOJIS = ["✨", "🔥", "⚡", "🚀", "💎", "🌀"];
