export function scrollIntoViewElement({
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
			error: `No element found matching ${text ? `text "${text}"` : `selector "${selector}"`}`,
		};
	}

	element.scrollIntoView({ block: "center", behavior: "instant" });

	const rect = element.getBoundingClientRect();
	return {
		scrolledTo: true,
		tag: element.tagName.toLowerCase(),
		text: element.textContent?.slice(0, 100),
		position: {
			top: Math.round(rect.top),
			left: Math.round(rect.left),
		},
	};
}
