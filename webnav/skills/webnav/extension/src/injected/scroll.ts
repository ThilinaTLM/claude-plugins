export function scrollPage({
	direction,
	x,
	y,
	amount,
	selector,
}: {
	direction?: "up" | "down" | "left" | "right";
	x?: number;
	y?: number;
	amount?: number;
	selector?: string;
}) {
	const target = selector
		? document.querySelector(selector)
		: document.documentElement;

	if (!target) {
		return { error: `No element found matching selector "${selector}"` };
	}

	const scrollTarget = target === document.documentElement ? window : target;

	if (x !== undefined || y !== undefined) {
		const opts: ScrollToOptions = { behavior: "instant" };
		if (x !== undefined) opts.left = x;
		if (y !== undefined) opts.top = y;
		scrollTarget.scrollTo(opts);
	} else if (direction) {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const delta =
			amount ?? (direction === "left" || direction === "right" ? vw : vh);
		const opts: ScrollToOptions = { behavior: "instant" };

		switch (direction) {
			case "up":
				opts.top = -delta;
				break;
			case "down":
				opts.top = delta;
				break;
			case "left":
				opts.left = -delta;
				break;
			case "right":
				opts.left = delta;
				break;
		}
		scrollTarget.scrollBy(opts);
	}

	return {
		scrollX: window.scrollX,
		scrollY: window.scrollY,
	};
}
