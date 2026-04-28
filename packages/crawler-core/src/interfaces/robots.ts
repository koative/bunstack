export interface RobotsDecision {
	allowed: boolean;
	reason?: string;
	crawlDelaySec?: number;
}

export interface RobotsChecker {
	check(url: string, userAgent: string): Promise<RobotsDecision>;
}

export const allowAllRobots: RobotsChecker = {
	async check() {
		return { allowed: true };
	},
};
