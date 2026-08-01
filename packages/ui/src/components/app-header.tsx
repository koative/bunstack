"use client";

import { Button, buttonVariants } from "@arc/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@arc/ui/components/input-group";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@arc/ui/components/sheet";
import { useScrollDirection } from "@arc/ui/hooks/use-scroll-direction";
import { useSearchHistory } from "@arc/ui/hooks/use-search-history";
import { cn } from "@arc/ui/lib/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

export type CategoryItem = {
	label: string;
	href: string;
};

export type CategoryGroup = {
	label: string;
	items: CategoryItem[];
};

type LinkProps = {
	href: string;
	className?: string;
	children?: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	"aria-label"?: string;
};

export type LinkLike = React.ComponentType<LinkProps>;

const DefaultLink: LinkLike = ({ href, ...props }) => (
	<a href={href} {...props} />
);

type AppHeaderProps = {
	/** Brand link href */
	brandHref?: string;
	/** Logo slot — typically an Image or SVG */
	logo?: React.ReactNode;
	/** Brand title (e.g. "arcstack") */
	title: string;
	/** Brand subtitle (e.g. "Search") */
	subtitle?: string;
	/** Right-side action buttons (theme toggle, library, etc.) */
	actions?: React.ReactNode;
	/** Categories sheet — if empty/undefined the trigger is hidden */
	categories?: CategoryGroup[];
	/** Pathname for active-link matching (pass usePathname() result) */
	pathname?: string;
	/** Polymorphic link component (e.g. next/link). Defaults to <a>. */
	LinkComponent?: LinkLike;
	/** Search submit handler. If absent, search UI is hidden. */
	onSearch?: (query: string) => void;
	/** Initial search value */
	defaultQuery?: string;
	/** Rotating placeholder hints */
	searchPlaceholders?: string[];
	/** Rotating emoji on the categories trigger */
	categoryEmojis?: string[];
	/** localStorage key for search history */
	searchHistoryKey?: string;
	/** Override sheet trigger label (defaults to "Explore") */
	categoryLabel?: string;
	/** Sheet title heading (defaults to "Categories") */
	categoryTitle?: string;
	className?: string;
};

const DEFAULT_PLACEHOLDERS = ["Search..."];
const DEFAULT_EMOJIS = ["✨"];

function useRotating<T>(values: readonly T[], intervalMs: number): T {
	const [index, setIndex] = React.useState(0);
	React.useEffect(() => {
		if (values.length <= 1) return;
		const id = setInterval(
			() => setIndex((i) => (i + 1) % values.length),
			intervalMs,
		);
		return () => clearInterval(id);
	}, [values.length, intervalMs]);
	return values[index] ?? values[0] ?? (undefined as T);
}

type SearchHistoryPanelProps = {
	items: string[];
	onSelect: (entry: string) => void;
	onRemove: (entry: string) => void;
	onClear: () => void;
	className?: string;
};

function SearchHistoryPanel({
	items,
	onSelect,
	onRemove,
	onClear,
	className,
}: SearchHistoryPanelProps) {
	return (
		<div
			className={cn(
				"z-50 max-h-72 overflow-y-auto rounded-lg border border-border/60 bg-popover shadow-lg",
				className,
			)}
			role="listbox"
			aria-label="Recent searches"
			onMouseDown={(event) => event.preventDefault()}
		>
			<div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5">
				<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
					Recent searches
				</span>
				<button
					type="button"
					onClick={onClear}
					className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Clear
				</button>
			</div>
			<ul className="pb-2">
				{items.map((entry) => (
					<li key={entry} className="group flex items-center">
						<button
							type="button"
							onClick={() => onSelect(entry)}
							className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
						>
							<Search
								className="size-3.5 text-muted-foreground"
								aria-hidden="true"
							/>
							<span className="truncate">{entry}</span>
						</button>
						<button
							type="button"
							onClick={() => onRemove(entry)}
							className="mr-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
							aria-label={`Remove ${entry} from history`}
						>
							<X className="size-3.5" />
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

type CategoriesSheetProps = {
	groups: CategoryGroup[];
	pathname?: string;
	emojis: readonly string[];
	triggerLabel: string;
	title: string;
	LinkComponent: LinkLike;
};

function CategoriesSheet({
	groups,
	pathname,
	emojis,
	triggerLabel,
	title,
	LinkComponent,
}: CategoriesSheetProps) {
	const [open, setOpen] = React.useState(false);
	const emoji = useRotating(emojis, 2000);

	if (groups.length === 0) return null;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<button
						type="button"
						className="relative flex size-8 items-center justify-center gap-1.5 rounded-full bg-primary text-xs font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/85 active:scale-95 sm:size-auto sm:rounded-full sm:px-3.5 sm:py-1.5 sm:text-sm"
						aria-label={triggerLabel}
					/>
				}
			>
				<span
					className="inline-block text-sm leading-none sm:text-base"
					key={emoji}
				>
					{emoji}
				</span>
				<span className="hidden text-sm sm:inline">{triggerLabel}</span>
			</SheetTrigger>
			<SheetContent side="right" className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="text-lg font-bold tracking-tight">
						{title} {emoji}
					</SheetTitle>
				</SheetHeader>

				<div className="space-y-6 px-6 pb-8">
					{groups.map((group) => (
						<section key={group.label} className="space-y-3">
							<p className="text-xs font-bold uppercase tracking-widest text-primary/70">
								{group.label}
							</p>
							<div className="flex flex-wrap gap-2">
								{group.items.map((item) => {
									const active = pathname === item.href;
									return (
										<LinkComponent
											key={item.href}
											href={item.href}
											onClick={() => setOpen(false)}
											className={cn(
												buttonVariants({ variant: "outline", size: "sm" }),
												active &&
													"bg-primary/15 text-primary border-primary/30 dark:bg-primary/10 dark:border-primary/25",
											)}
										>
											{item.label}
										</LinkComponent>
									);
								})}
							</div>
						</section>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function AppHeader({
	brandHref = "/",
	logo,
	title,
	subtitle,
	actions,
	categories = [],
	pathname,
	LinkComponent = DefaultLink,
	onSearch,
	defaultQuery = "",
	searchPlaceholders = DEFAULT_PLACEHOLDERS,
	categoryEmojis = DEFAULT_EMOJIS,
	searchHistoryKey = "arcstack-search-history",
	categoryLabel = "Explore",
	categoryTitle = "Categories",
	className,
}: AppHeaderProps) {
	const headerRef = React.useRef<HTMLElement | null>(null);
	const headerVisible = useScrollDirection();
	const placeholder = useRotating(searchPlaceholders, 5000);

	const [query, setQuery] = React.useState(defaultQuery);
	const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
	const [historyFocused, setHistoryFocused] = React.useState<
		"desktop" | "mobile" | null
	>(null);

	const {
		items: searchHistory,
		push: pushHistory,
		remove: removeHistory,
		clear: clearHistory,
	} = useSearchHistory(searchHistoryKey);

	React.useEffect(() => {
		setQuery(defaultQuery);
	}, [defaultQuery]);

	React.useEffect(() => {
		if (!mobileSearchOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMobileSearchOpen(false);
		};
		const onMouseDown = (event: MouseEvent) => {
			if (!headerRef.current?.contains(event.target as Node)) {
				setMobileSearchOpen(false);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("mousedown", onMouseDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("mousedown", onMouseDown);
		};
	}, [mobileSearchOpen]);

	const submit = (value: string) => {
		const trimmed = value.trim();
		if (trimmed) pushHistory(trimmed);
		onSearch?.(trimmed);
		setMobileSearchOpen(false);
		setHistoryFocused(null);
	};

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		submit(query);
	};

	const onSelectHistory = (entry: string) => {
		setQuery(entry);
		submit(entry);
	};

	const showSearch = typeof onSearch === "function";

	return (
		<header
			ref={headerRef}
			className={cn(
				"sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-out",
				headerVisible ? "translate-y-0" : "-translate-y-full",
				className,
			)}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
				<LinkComponent
					href={brandHref}
					className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
				>
					{logo}
					<div className="leading-tight">
						<span className="block text-sm font-bold tracking-tight">
							{title}
						</span>
						{subtitle ? (
							<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
								{subtitle}
							</span>
						) : null}
					</div>
				</LinkComponent>

				{showSearch ? (
					<form
						onSubmit={onSubmit}
						className="relative mx-auto hidden max-w-md flex-1 md:block"
					>
						<InputGroup className="h-10 border-border/60 bg-muted/50 shadow-none transition-colors hover:bg-muted/80">
							<InputGroupAddon
								align="inline-start"
								className="pl-3.5 text-muted-foreground"
							>
								<Search className="size-4" />
							</InputGroupAddon>
							<InputGroupInput
								type="search"
								value={query}
								onChange={(event) => setQuery(event.currentTarget.value)}
								onFocus={() => setHistoryFocused("desktop")}
								onBlur={() =>
									window.setTimeout(
										() =>
											setHistoryFocused((current) =>
												current === "desktop" ? null : current,
											),
										150,
									)
								}
								placeholder={placeholder}
								aria-label="Search"
								className="h-10"
							/>
						</InputGroup>
						{historyFocused === "desktop" && searchHistory.length > 0 ? (
							<SearchHistoryPanel
								items={searchHistory}
								onSelect={onSelectHistory}
								onRemove={removeHistory}
								onClear={clearHistory}
								className="absolute left-0 right-0 top-full mt-1.5"
							/>
						) : null}
					</form>
				) : (
					<div className="flex-1" />
				)}

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
					{showSearch ? (
						<Button
							type="button"
							variant="ghost"
							size="icon-lg"
							className="md:hidden"
							onClick={() => setMobileSearchOpen((open) => !open)}
							aria-label="Toggle search"
						>
							<Search className="size-4" />
						</Button>
					) : null}

					{actions}

					{categories.length > 0 ? (
						<CategoriesSheet
							groups={categories}
							pathname={pathname}
							emojis={categoryEmojis}
							triggerLabel={categoryLabel}
							title={categoryTitle}
							LinkComponent={LinkComponent}
						/>
					) : null}
				</div>
			</div>

			{showSearch ? (
				<div
					className={cn(
						"overflow-hidden border-t border-border/30 px-4 transition-all duration-200 ease-out sm:px-6 md:hidden",
						mobileSearchOpen ? "max-h-[72px] py-2.5" : "max-h-0 py-0",
					)}
				>
					<form onSubmit={onSubmit} className="relative">
						<InputGroup className="h-10 border-border/60 bg-muted/50 shadow-none">
							<InputGroupAddon
								align="inline-start"
								className="pl-3.5 text-muted-foreground"
							>
								<Search className="size-4" />
							</InputGroupAddon>
							<InputGroupInput
								type="search"
								value={query}
								onChange={(event) => setQuery(event.currentTarget.value)}
								onFocus={() => setHistoryFocused("mobile")}
								onBlur={() =>
									window.setTimeout(
										() =>
											setHistoryFocused((current) =>
												current === "mobile" ? null : current,
											),
										150,
									)
								}
								placeholder={placeholder}
								aria-label="Search"
							/>
						</InputGroup>
						{historyFocused === "mobile" && searchHistory.length > 0 ? (
							<SearchHistoryPanel
								items={searchHistory}
								onSelect={onSelectHistory}
								onRemove={removeHistory}
								onClear={clearHistory}
								className="absolute left-0 right-0 top-full mt-1.5"
							/>
						) : null}
					</form>
				</div>
			) : null}
		</header>
	);
}
