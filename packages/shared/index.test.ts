import { describe, expect, it, mock } from "bun:test";
import { utils } from "./index";

describe("utils", () => {
	it("calls console.log with the given message", () => {
		const consoleSpy = mock(() => {});
		const original = console.log;
		console.log = consoleSpy;

		utils.log("hello");

		expect(consoleSpy).toHaveBeenCalledWith("hello");
		console.log = original;
	});
});
