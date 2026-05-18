"use client";

import { AppHeader } from "@eros/ui/app-header";
import { ThemeToggle } from "@eros/ui/theme-toggle";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
	HEADER_EMOJIS,
	MOCK_CATEGORIES,
	SEARCH_PLACEHOLDERS,
} from "./mock-categories";

const NextLink: React.ComponentType<{
	href: string;
	className?: string;
	children?: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}> = ({ href, ...props }) => <Link href={href} {...props} />;

export function SiteHeader() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentQuery = searchParams.get("q") ?? "";

	const onSearch = React.useCallback(
		(query: string) => {
			const params = new URLSearchParams();
			if (query) params.set("q", query);
			const qs = params.toString();
			router.push(qs ? `/?${qs}` : "/");
		},
		[router],
	);

	return (
		<AppHeader
			title="eros"
			subtitle="Bun-native monorepo"
			brandHref="/"
			LinkComponent={NextLink}
			pathname={pathname}
			categories={MOCK_CATEGORIES}
			searchPlaceholders={SEARCH_PLACEHOLDERS}
			categoryEmojis={HEADER_EMOJIS}
			defaultQuery={currentQuery}
			onSearch={onSearch}
			actions={<ThemeToggle />}
		/>
	);
}
