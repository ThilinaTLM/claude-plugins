export function clickElement({
	text,
	selector,
	index = 0,
}: { text?: string; selector?: string; index?: number }) {
	let elements: Element[] = [];

	if (selector) {
		elements = Array.from(document.querySelectorAll(selector));
	} else if (text) {
		// Find elements containing text
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
		);

		const textNodes: Text[] = [];
		while (walker.nextNode()) {
			if (walker.currentNode.textContent?.includes(text)) {
				textNodes.push(walker.currentNode as Text);
			}
		}

		// Get clickable parent elements
		for (const node of textNodes) {
			let el = node.parentElement;
			while (el && el !== document.body) {
				const clickable =
					el.tagName === "A" ||
					el.tagName === "BUTTON" ||
					el.onclick ||
					el.getAttribute("role") === "button" ||
					getComputedStyle(el).cursor === "pointer";
				if (clickable) {
					elements.push(el);
					break;
				}
				el = el.parentElement;
			}
			if (el === document.body && node.parentElement) {
				elements.push(node.parentElement);
			}
		}
	}

	if (elements.length === 0) {
		return {
			error: `No element found matching ${text ? `text "${text}"` : `selector "${selector}"`}`,
		};
	}

	const element = elements[index] as HTMLElement | undefined;
	if (!element) {
		return {
			error: `Index ${index} out of range (found ${elements.length} elements)`,
		};
	}

	element.scrollIntoView({ behavior: "instant", block: "center" });
	element.click();

	return {
		clicked: true,
		tag: element.tagName.toLowerCase(),
		text: element.textContent?.slice(0, 100),
	};
}
