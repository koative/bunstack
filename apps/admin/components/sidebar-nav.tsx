"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ActivityIcon,
	DatabaseIcon,
	HomeIcon,
	SendIcon,
} from "lucide-react";
import { cn } from "@eros/ui/utils";

const items = [
	{ href: "/", label: "Overview", icon: HomeIcon },
	{ href: "/submit", label: "Submit", icon: SendIcon },
	{ href: "/queues", label: "Queues", icon: ActivityIcon },
	{ href: "/targets", label: "Targets", icon: DatabaseIcon },
] as const;

export function SidebarNav() {
	const pathname = usePathname();
	return (
		<nav className="flex flex-col gap-1 p-3">
			{items.map((item) => {
				const Icon = item.icon;
				const active =
					item.href === "/"
						? pathname === "/"
						: pathname.startsWith(item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
							active
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
						)}
					>
						<Icon className="size-4" />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
