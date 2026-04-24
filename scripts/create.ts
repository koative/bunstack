#!/usr/bin/env bun
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";

function log(symbol: string, color: string, msg: string) {
	console.log(`${color}${symbol}${RESET} ${msg}`);
}

const ok = (msg: string) => log("✓", GREEN, msg);
const info = (msg: string) => log("→", CYAN, msg);
const err = (msg: string) => log("✗", RED, msg);

// --- arg parsing ---

const [type, rawName] = Bun.argv.slice(2);

if (!type || !rawName) {
	console.log(`
${BOLD}Usage${RESET}
  bun run create app <name>
  bun run create shared <name>

${BOLD}Examples${RESET}
  bun run create app dashboard
  bun run create shared ui
`);
	process.exit(0);
}

if (type !== "app" && type !== "shared") {
	err(`Unknown type "${type}". Use "app" or "shared".`);
	process.exit(1);
}

const name = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const isApp = type === "app";
const root = join(import.meta.dir, "..");
const dir = isApp ? join(root, "apps", name) : join(root, "packages", name);
const pkgName = isApp ? `@apps/${name}` : `@${name}`;
const tsconfigDepth = isApp ? "../../tsconfig.json" : "../../tsconfig.json";

// --- guard ---

if (existsSync(dir)) {
	err(`"${dir}" already exists.`);
	process.exit(1);
}

// --- templates ---

const appPackageJson = () => `{
\t"name": "${pkgName}",
\t"module": "src/index.ts",
\t"type": "module",
\t"private": true,
\t"scripts": {
\t\t"dev": "bun run --hot src/index.ts",
\t\t"build": "bun build ./src/index.ts --outdir ./dist --target bun",
\t\t"start": "bun src/index.ts",
\t\t"typecheck": "tsc --noEmit"
\t},
\t"dependencies": {
\t\t"@arc/shared": "workspace:*"
\t}
}
`;

const sharedPackageJson = () => `{
\t"name": "${pkgName}",
\t"module": "index.ts",
\t"type": "module",
\t"private": true,
\t"scripts": {
\t\t"test": "bun test",
\t\t"typecheck": "tsc --noEmit"
\t}
}
`;

const tsconfig = () => `{
\t"extends": "${tsconfigDepth}"
}
`;

const appEntrypoint = () => `import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello from ${name}!"));

export default app;
`;

const sharedEntrypoint = () => `export const ${toCamel(name)} = {};
`;

const readme = () =>
	isApp
		? `# ${pkgName}

## Scripts

\`\`\`bash
bun run dev       # hot-reload
bun run start     # production
bun run build     # compile to dist/
bun run typecheck # tsc --noEmit
\`\`\`
`
		: `# ${pkgName}

## Usage

\`\`\`typescript
import { ${toCamel(name)} } from "${pkgName}";
\`\`\`

## Scripts

\`\`\`bash
bun test          # run tests
bun run typecheck # tsc --noEmit
\`\`\`
`;

function toCamel(s: string) {
	return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// --- write files ---

type FileEntry = [path: string, content: string];

const files: FileEntry[] = isApp
	? [
			[join(dir, "package.json"), appPackageJson()],
			[join(dir, "tsconfig.json"), tsconfig()],
			[join(dir, "src", "index.ts"), appEntrypoint()],
			[join(dir, "README.md"), readme()],
		]
	: [
			[join(dir, "package.json"), sharedPackageJson()],
			[join(dir, "tsconfig.json"), tsconfig()],
			[join(dir, "index.ts"), sharedEntrypoint()],
			[
				join(dir, "index.test.ts"),
				`import { describe, expect, it } from "bun:test";\nimport { ${toCamel(name)} } from ".";\n\ndescribe("${name}", () => {\n\tit("exists", () => {\n\t\texpect(${toCamel(name)}).toBeDefined();\n\t});\n});\n`,
			],
			[join(dir, "README.md"), readme()],
		];

console.log(`\n${BOLD}Creating ${type} "${name}"${RESET}\n`);

mkdirSync(isApp ? join(dir, "src") : dir, { recursive: true });

for (const [path, content] of files) {
	await Bun.write(path, content);
	ok(`${DIM}${path.replace(`${root}/`, "")}${RESET}`);
}

// --- bun install ---

console.log();
info("Running bun install…");
const proc = Bun.spawn(["bun", "install"], {
	cwd: root,
	stdout: "inherit",
	stderr: "inherit",
});
await proc.exited;

console.log(`\n${GREEN}${BOLD}Done!${RESET} ${pkgName} is ready.\n`);
