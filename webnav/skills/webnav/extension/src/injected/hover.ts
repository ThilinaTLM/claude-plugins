export function hoverElement({
	selector,
	text,
}: { selector?: string; text?: string }) {
	let element: Element | null = null;

	if (selector) {
		element = document.querySelector(selector);
	} else if (text) {
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
		);
		const candidates: Element[] = [];
		while (walker.nextNode()) {
			if (walker.currentNode.textContent?.includes(text)) {
				if (walker.currentNode.parentElement) {
					candidates.push(walker.currentNode.parentElement);
				}
			}
		}
		if (candidates.length > 0) {
			candidates.sort((a, b) => {
				const aExact = a.textContent?.trim() === text;
				const bExact = b.textContent?.trim() === text;
				if (aExact !== bExact) return aExact ? -1 : 1;
				return (a.textContent?.length || 0) - (b.textContent?.length || 0);
			});
			element = candidates[0];
		}
	}

	if (!element) {
		return {
			error: `Element not found matching ${text ? `text "${text}"` : `selector "${selector}"`}`,
		};
	}

	const el = element as HTMLElement;
	el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
	el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

	return {
		hovered: true,
		tag: el.tagName.toLowerCase(),
		text: el.textContent?.slice(0, 100),
	};
}
