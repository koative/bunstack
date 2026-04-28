import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@eros/ui/empty";

export function EmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
}) {
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				{icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
				<EmptyTitle>{title}</EmptyTitle>
				{description ? <EmptyDescription>{description}</EmptyDescription> : null}
			</EmptyHeader>
			{action ? <EmptyContent>{action}</EmptyContent> : null}
		</Empty>
	);
}
