import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@arc/ui"],
	experimental: {
		packageManager: "bun",
	},
};

export default nextConfig;
