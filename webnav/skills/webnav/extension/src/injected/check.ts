export function checkElement({
	selector,
	text,
	checked,
}: { selector?: string; text?: string; checked: boolean }) {
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

	const el = element as HTMLInputElement;
	const type = el.type?.toLowerCase();
	if (type !== "checkbox" && type !== "radio") {
		return {
			error: `Element is <${el.tagName.toLowerCase()} type="${type}">, expected checkbox or radio`,
		};
	}

	const changed = el.checked !== checked;
	if (changed) {
		el.checked = checked;
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}

	return { checked: el.checked, changed };
}
