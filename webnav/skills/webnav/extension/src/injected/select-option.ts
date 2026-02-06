export function selectOption({
	selector,
	text,
	optionValue,
	optionText,
}: {
	selector?: string;
	text?: string;
	optionValue?: string;
	optionText?: string;
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

	if (element.tagName !== "SELECT") {
		return {
			error: `Element is <${element.tagName.toLowerCase()}>, expected <select>`,
		};
	}

	const select = element as HTMLSelectElement;
	const options = Array.from(select.options);
	let option: HTMLOptionElement | undefined;

	if (optionValue !== undefined) {
		option = options.find((o) => o.value === optionValue);
	} else if (optionText !== undefined) {
		option = options.find((o) => o.textContent?.includes(optionText));
	}

	if (!option) {
		return {
			error: `Option not found matching ${optionValue !== undefined ? `value "${optionValue}"` : `text "${optionText}"`}`,
		};
	}

	select.value = option.value;
	select.dispatchEvent(new Event("change", { bubbles: true }));

	return {
		selectedValue: option.value,
		selectedText: option.textContent?.trim(),
	};
}
