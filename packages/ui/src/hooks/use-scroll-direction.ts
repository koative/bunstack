"use client";

import * as React from "react";

export function useScrollDirection(): boolean {
	const [visible, setVisible] = React.useState(true);
	const lastY = React.useRef(0);

	React.useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY;
			if (y < 60) {
				setVisible(true);
			} else if (y - lastY.current > 10) {
				setVisible(false);
			} else if (lastY.current - y > 10) {
				setVisible(true);
			}
			lastY.current = y;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return visible;
}
