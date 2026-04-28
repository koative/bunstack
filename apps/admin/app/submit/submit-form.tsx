"use client";

import { useActionState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@eros/ui/alert";
import { Button } from "@eros/ui/button";
import { Field, FieldDescription, FieldLabel } from "@eros/ui/field";
import { Textarea } from "@eros/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@eros/ui/select";
import { submitJobs, type SubmitState } from "./actions";

const initialState: SubmitState = { ok: false, message: "" };

export function SubmitForm({ sources }: { sources: string[] }) {
	const [state, action, pending] = useActionState(submitJobs, initialState);

	return (
		<form action={action} className="flex max-w-2xl flex-col gap-5">
			<Field>
				<FieldLabel htmlFor="source">Source</FieldLabel>
				<Select name="source" defaultValue={sources[0] ?? ""}>
					<SelectTrigger id="source">
						<SelectValue placeholder="pick a registered crawler" />
					</SelectTrigger>
					<SelectContent>
						{sources.map((s) => (
							<SelectItem key={s} value={s}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldDescription>
					Only crawlers registered in services/crawler appear here.
				</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor="urls">URLs</FieldLabel>
				<Textarea
					id="urls"
					name="urls"
					rows={10}
					placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
					className="font-mono text-xs"
				/>
				<FieldDescription>
					One URL per line. Max 1000. Duplicates and recently-crawled URLs are
					skipped automatically.
				</FieldDescription>
			</Field>

			<div className="flex items-center gap-3">
				<Button type="submit" disabled={pending || sources.length === 0}>
					{pending ? "Submitting..." : "Submit"}
				</Button>
				{state.message ? (
					<Alert
						className={
							state.ok ? "max-w-xl" : "max-w-xl border-destructive/30 text-destructive"
						}
					>
						{state.ok ? <CheckIcon /> : <XIcon />}
						<AlertTitle>{state.ok ? "Submitted" : "Error"}</AlertTitle>
						<AlertDescription>{state.message}</AlertDescription>
					</Alert>
				) : null}
			</div>
		</form>
	);
}
