export function clickElement({
	text,
	selector,
	index = 0,
	exact = false,
}: { text?: string; selector?: string; index?: number; exact?: boolean }) {
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
			const content = walker.currentNode.textContent || "";
			if (exact ? content.trim() === text : content.includes(text)) {
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

		// Deduplicate and sort: prefer exact text matches, then interactive elements, then shorter text
		elements = [...new Set(elements)];
		const isInteractive = (el: Element) => {
			const tag = el.tagName;
			return (
				tag === "A" ||
				tag === "BUTTON" ||
				tag === "INPUT" ||
				tag === "SELECT" ||
				tag === "TEXTAREA" ||
				el.getAttribute("role") === "button" ||
				el.getAttribute("role") === "link"
			);
		};
		elements.sort((a, b) => {
			const aExact = a.textContent?.trim() === text;
			const bExact = b.textContent?.trim() === text;
			if (aExact !== bExact) return aExact ? -1 : 1;

			const aInt = isInteractive(a);
			const bInt = isInteractive(b);
			if (aInt !== bInt) return aInt ? -1 : 1;

			return (a.textContent?.length || 0) - (b.textContent?.length || 0);
		});
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
