export function queryElement({
	type,
	selector,
	text,
	name,
}: {
	type: string;
	selector?: string;
	text?: string;
	name?: string;
}) {
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

	const el = element as HTMLElement & HTMLInputElement;

	switch (type) {
		case "gettext":
			return { text: (el.textContent ?? "").slice(0, 10000) };

		case "inputvalue":
			return { value: el.value ?? "" };

		case "getattribute":
			if (!name) return { error: "Attribute name is required" };
			return {
				name,
				value: el.getAttribute(name),
				exists: el.hasAttribute(name),
			};

		case "isvisible": {
			const style = getComputedStyle(el);
			const rect = el.getBoundingClientRect();
			const visible =
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				Number.parseFloat(style.opacity) > 0 &&
				rect.width > 0 &&
				rect.height > 0;
			return { visible };
		}

		case "isenabled":
			return { enabled: !el.disabled };

		case "ischecked":
			return { checked: !!el.checked };

		case "boundingbox": {
			const rect = el.getBoundingClientRect();
			return {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height),
				top: Math.round(rect.top),
				right: Math.round(rect.right),
				bottom: Math.round(rect.bottom),
				left: Math.round(rect.left),
			};
		}

		default:
			return { error: `Unknown query type: ${type}` };
	}
}
