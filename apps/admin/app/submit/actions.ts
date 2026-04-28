"use server";

import { revalidatePath } from "next/cache";
import { crawlerApi } from "@/lib/api";

export interface SubmitState {
	ok: boolean;
	message: string;
	accepted?: number;
	skipped?: number;
}

export async function submitJobs(
	_prev: SubmitState | undefined,
	formData: FormData,
): Promise<SubmitState> {
	const source = String(formData.get("source") ?? "").trim();
	const urlsRaw = String(formData.get("urls") ?? "").trim();

	if (!source) return { ok: false, message: "Source is required" };
	if (!urlsRaw) return { ok: false, message: "Paste at least one URL" };

	const urls = urlsRaw
		.split(/\r?\n/)
		.map((u) => u.trim())
		.filter(Boolean);

	if (urls.length === 0)
		return { ok: false, message: "Paste at least one URL" };
	if (urls.length > 1000)
		return { ok: false, message: "Submit at most 1000 URLs at a time" };

	try {
		const result = await crawlerApi.submitJob(source, urls);
		revalidatePath("/");
		revalidatePath(`/sources/${source}`);
		return {
			ok: true,
			message: `Accepted ${result.accepted}, skipped ${result.skipped}`,
			accepted: result.accepted,
			skipped: result.skipped,
		};
	} catch (err) {
		return { ok: false, message: (err as Error).message };
	}
}
