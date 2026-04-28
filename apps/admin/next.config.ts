import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@eros/ui"],
	output: "standalone",
	outputFileTracingRoot: "../../",
};

export default nextConfig;
