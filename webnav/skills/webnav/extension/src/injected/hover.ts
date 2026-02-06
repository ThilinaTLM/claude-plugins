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
		while (walker.nextNode()) {
			if (walker.currentNode.textContent?.includes(text)) {
				element = walker.currentNode.parentElement;
				break;
			}
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
