"use client";

import { useState } from "react";
import {
	BellIcon,
	CalendarIcon,
	CheckIcon,
	ChevronRightIcon,
	CreditCardIcon,
	HomeIcon,
	MailIcon,
	SearchIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@eros/ui/accordion";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@eros/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@eros/ui/alert-dialog";
import { AspectRatio } from "@eros/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@eros/ui/avatar";
import { Badge } from "@eros/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@eros/ui/breadcrumb";
import { Button } from "@eros/ui/button";
import { ButtonGroup } from "@eros/ui/button-group";
import { Calendar } from "@eros/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@eros/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@eros/ui/carousel";
import { Checkbox } from "@eros/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@eros/ui/collapsible";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@eros/ui/context-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@eros/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@eros/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@eros/ui/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@eros/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@eros/ui/field";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@eros/ui/hover-card";
import { Input } from "@eros/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@eros/ui/input-group";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@eros/ui/input-otp";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@eros/ui/item";
import { Kbd, KbdGroup } from "@eros/ui/kbd";
import { Label } from "@eros/ui/label";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@eros/ui/menubar";
import {
	NativeSelect,
	NativeSelectOption,
} from "@eros/ui/native-select";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@eros/ui/navigation-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@eros/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@eros/ui/popover";
import { Progress } from "@eros/ui/progress";
import { RadioGroup, RadioGroupItem } from "@eros/ui/radio-group";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@eros/ui/resizable";
import { ScrollArea } from "@eros/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@eros/ui/select";
import { Separator } from "@eros/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@eros/ui/sheet";
import { Skeleton } from "@eros/ui/skeleton";
import { Slider } from "@eros/ui/slider";
import { Toaster } from "@eros/ui/sonner";
import { Spinner } from "@eros/ui/spinner";
import { Switch } from "@eros/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@eros/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eros/ui/tabs";
import { Textarea } from "@eros/ui/textarea";
import { ThemeToggle } from "@eros/ui/theme-toggle";
import { Toggle } from "@eros/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@eros/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@eros/ui/tooltip";

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border bg-card p-6">
			<h2 className="font-semibold text-lg">{title}</h2>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</section>
	);
}

export default function Page() {
	const [progress, setProgress] = useState(40);
	const [date, setDate] = useState<Date | undefined>(new Date());

	return (
		<TooltipProvider>
			<main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
				<header className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl">@eros/ui showcase</h1>
						<p className="text-muted-foreground">
							All components from the design system.
						</p>
					</div>
					<ThemeToggle />
				</header>

				<Section title="Button & Button Group">
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
					<Button size="sm">Small</Button>
					<Button size="lg">Large</Button>
					<Button disabled>Disabled</Button>
					<ButtonGroup>
						<Button variant="outline">Left</Button>
						<Button variant="outline">Mid</Button>
						<Button variant="outline">Right</Button>
					</ButtonGroup>
				</Section>

				<Section title="Badge">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</Section>

				<Section title="Avatar">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
						<AvatarFallback>SC</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
				</Section>

				<Section title="Alert">
					<Alert className="w-full">
						<BellIcon />
						<AlertTitle>Heads up!</AlertTitle>
						<AlertDescription>
							You can add components to your app using the CLI.
						</AlertDescription>
						<AlertAction>
							<Button size="sm" variant="outline">
								Dismiss
							</Button>
						</AlertAction>
					</Alert>
				</Section>

				<Section title="Inputs & Form Controls">
					<div className="flex w-full flex-col gap-3">
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input id="email" type="email" placeholder="you@example.com" />
							<FieldDescription>We'll never share your email.</FieldDescription>
						</Field>
						<Field>
							<FieldLabel htmlFor="search">Search</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<SearchIcon className="size-4" />
								</InputGroupAddon>
								<InputGroupInput id="search" placeholder="Search..." />
							</InputGroup>
						</Field>
						<Field>
							<FieldLabel htmlFor="msg">Message</FieldLabel>
							<Textarea id="msg" placeholder="Type your message" />
						</Field>
						<Field>
							<FieldLabel htmlFor="select">Country</FieldLabel>
							<NativeSelect id="select" defaultValue="tr">
								<NativeSelectOption value="tr">Türkiye</NativeSelectOption>
								<NativeSelectOption value="us">USA</NativeSelectOption>
								<NativeSelectOption value="de">Germany</NativeSelectOption>
							</NativeSelect>
						</Field>
						<div className="flex items-center gap-2">
							<Label htmlFor="newsletter">Subscribe</Label>
							<Switch id="newsletter" />
							<Checkbox id="terms" />
							<Label htmlFor="terms">Accept terms</Label>
						</div>
						<RadioGroup defaultValue="a" className="flex gap-4">
							<div className="flex items-center gap-2">
								<RadioGroupItem value="a" id="r-a" />
								<Label htmlFor="r-a">Option A</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="b" id="r-b" />
								<Label htmlFor="r-b">Option B</Label>
							</div>
						</RadioGroup>
						<div className="flex items-center gap-2">
							<Label>Volume</Label>
							<Slider defaultValue={50} max={100} className="w-60" />
						</div>
					</div>
				</Section>

				<Section title="Select">
					<Select>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Pick a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="apple">Apple</SelectItem>
							<SelectItem value="banana">Banana</SelectItem>
							<SelectItem value="cherry">Cherry</SelectItem>
						</SelectContent>
					</Select>
				</Section>

				<Section title="OTP Input">
					<InputOTP maxLength={6}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</Section>

				<Section title="Toggle & Toggle Group">
					<Toggle>Bold</Toggle>
					<Toggle variant="outline">Italic</Toggle>
					<ToggleGroup defaultValue={["left"]}>
						<ToggleGroupItem value="left">L</ToggleGroupItem>
						<ToggleGroupItem value="center">C</ToggleGroupItem>
						<ToggleGroupItem value="right">R</ToggleGroupItem>
					</ToggleGroup>
				</Section>

				<Section title="Card">
					<Card className="w-80">
						<CardHeader>
							<CardTitle>Card title</CardTitle>
							<CardDescription>Description goes here.</CardDescription>
						</CardHeader>
						<CardContent>Body content for the card.</CardContent>
						<CardFooter>
							<Button size="sm">Action</Button>
						</CardFooter>
					</Card>
				</Section>

				<Section title="Item">
					<Item className="w-full">
						<ItemMedia>
							<UserIcon className="size-5" />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Profile</ItemTitle>
							<ItemDescription>View and edit your profile.</ItemDescription>
						</ItemContent>
					</Item>
				</Section>

				<Section title="Accordion">
					<Accordion className="w-full">
						<AccordionItem value="a">
							<AccordionTrigger>Is it accessible?</AccordionTrigger>
							<AccordionContent>Yes, it adheres to WAI-ARIA.</AccordionContent>
						</AccordionItem>
						<AccordionItem value="b">
							<AccordionTrigger>Is it styled?</AccordionTrigger>
							<AccordionContent>
								Yes, with sensible defaults.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</Section>

				<Section title="Collapsible">
					<Collapsible className="w-full">
						<CollapsibleTrigger
							render={<Button variant="outline">Toggle details</Button>}
						/>
						<CollapsibleContent className="mt-2 rounded-md border p-3 text-sm">
							Hidden content revealed.
						</CollapsibleContent>
					</Collapsible>
				</Section>

				<Section title="Tabs">
					<Tabs defaultValue="account" className="w-full">
						<TabsList>
							<TabsTrigger value="account">Account</TabsTrigger>
							<TabsTrigger value="password">Password</TabsTrigger>
						</TabsList>
						<TabsContent value="account" className="p-2 text-sm">
							Account settings content.
						</TabsContent>
						<TabsContent value="password" className="p-2 text-sm">
							Password settings content.
						</TabsContent>
					</Tabs>
				</Section>

				<Section title="Dialog / Alert Dialog / Sheet / Drawer">
					<Dialog>
						<DialogTrigger
							render={<Button variant="outline">Open dialog</Button>}
						/>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit profile</DialogTitle>
								<DialogDescription>
									Make changes to your profile here.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button>Save</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<AlertDialog>
						<AlertDialogTrigger
							render={<Button variant="destructive">Delete</Button>}
						/>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction>Confirm</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<Sheet>
						<SheetTrigger
							render={<Button variant="outline">Open sheet</Button>}
						/>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Sheet title</SheetTitle>
								<SheetDescription>Side sheet content.</SheetDescription>
							</SheetHeader>
						</SheetContent>
					</Sheet>
					<Drawer>
						<DrawerTrigger asChild>
							<Button variant="outline">Open drawer</Button>
						</DrawerTrigger>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Drawer</DrawerTitle>
								<DrawerDescription>Bottom drawer content.</DrawerDescription>
							</DrawerHeader>
							<DrawerFooter>
								<Button>Submit</Button>
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				</Section>

				<Section title="Popover / Hover Card / Tooltip">
					<Popover>
						<PopoverTrigger
							render={<Button variant="outline">Popover</Button>}
						/>
						<PopoverContent>Popover content here.</PopoverContent>
					</Popover>
					<HoverCard>
						<HoverCardTrigger
							render={<Button variant="link">@hovercard</Button>}
						/>
						<HoverCardContent>Preview content on hover.</HoverCardContent>
					</HoverCard>
					<Tooltip>
						<TooltipTrigger
							render={<Button variant="outline">Hover me</Button>}
						/>
						<TooltipContent>Tooltip text</TooltipContent>
					</Tooltip>
				</Section>

				<Section title="Dropdown / Context / Menubar">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="outline">Dropdown</Button>}
						/>
						<DropdownMenuContent>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<UserIcon /> Profile
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCardIcon /> Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<SettingsIcon /> Settings
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<ContextMenu>
						<ContextMenuTrigger className="rounded-md border border-dashed px-4 py-2 text-sm">
							Right-click me
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem>Back</ContextMenuItem>
							<ContextMenuItem>Forward</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem>Reload</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
					<Menubar>
						<MenubarMenu>
							<MenubarTrigger>File</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>New</MenubarItem>
								<MenubarItem>Open</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>Quit</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger>Edit</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>Undo</MenubarItem>
								<MenubarItem>Redo</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
					</Menubar>
				</Section>

				<Section title="Navigation Menu">
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
								<NavigationMenuContent className="p-3">
									<NavigationMenuLink>Introduction</NavigationMenuLink>
									<NavigationMenuLink>Installation</NavigationMenuLink>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</Section>

				<Section title="Breadcrumb / Pagination">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="#">
									<HomeIcon className="size-4" />
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="#">Components</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Showcase</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" isActive>
									1
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#">2</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext href="#" />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</Section>

				<Section title="Table">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>INV-001</TableCell>
								<TableCell>
									<Badge>Paid</Badge>
								</TableCell>
								<TableCell>$250.00</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>INV-002</TableCell>
								<TableCell>
									<Badge variant="secondary">Pending</Badge>
								</TableCell>
								<TableCell>$150.00</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Section>

				<Section title="Progress / Spinner / Skeleton">
					<div className="flex w-full flex-col gap-3">
						<Progress value={progress} className="w-full" />
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => setProgress((p) => Math.max(0, p - 10))}
							>
								-10
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setProgress((p) => Math.min(100, p + 10))}
							>
								+10
							</Button>
							<Spinner />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-full" />
							<div className="flex flex-col gap-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
					</div>
				</Section>

				<Section title="Calendar">
					<Calendar mode="single" selected={date} onSelect={setDate} />
				</Section>

				<Section title="Aspect Ratio / Carousel">
					<div className="w-64">
						<AspectRatio ratio={16 / 9} className="rounded-md bg-muted">
							<div className="flex h-full items-center justify-center text-sm">
								16 / 9
							</div>
						</AspectRatio>
					</div>
					<Carousel className="w-64">
						<CarouselContent>
							{[1, 2, 3].map((n) => (
								<CarouselItem key={n}>
									<div className="flex h-32 items-center justify-center rounded-md bg-muted text-2xl">
										{n}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</Section>

				<Section title="Scroll Area / Resizable">
					<ScrollArea className="h-32 w-48 rounded-md border p-2 text-sm">
						{Array.from({ length: 20 }).map((_, i) => (
							<div key={i}>Item {i + 1}</div>
						))}
					</ScrollArea>
					<ResizablePanelGroup
						orientation="horizontal"
						className="h-32 w-80 rounded-md border"
					>
						<ResizablePanel defaultSize={50} className="p-2 text-sm">
							Left
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={50} className="p-2 text-sm">
							Right
						</ResizablePanel>
					</ResizablePanelGroup>
				</Section>

				<Section title="Empty State">
					<Empty className="w-full">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MailIcon />
							</EmptyMedia>
							<EmptyTitle>No messages</EmptyTitle>
							<EmptyDescription>
								You're all caught up. New messages will appear here.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button size="sm">Compose</Button>
						</EmptyContent>
					</Empty>
				</Section>

				<Section title="Kbd / Separator">
					<KbdGroup>
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
					<Separator className="my-2" />
					<div className="flex items-center gap-2 text-sm">
						<span>Press</span>
						<Kbd>Enter</Kbd>
						<span>to continue</span>
					</div>
				</Section>

				<Section title="Toast (Sonner)">
					<Button
						onClick={() =>
							toast.success("Saved", {
								description: "Your changes were saved.",
							})
						}
					>
						Show toast
					</Button>
					<Button
						variant="destructive"
						onClick={() => toast.error("Something went wrong")}
					>
						Show error
					</Button>
				</Section>

				<Section title="Misc icons">
					<div className="flex items-center gap-2 text-sm">
						<CheckIcon className="size-4" />
						<CalendarIcon className="size-4" />
						<ChevronRightIcon className="size-4" />
					</div>
				</Section>

				<Toaster />
			</main>
		</TooltipProvider>
	);
}
