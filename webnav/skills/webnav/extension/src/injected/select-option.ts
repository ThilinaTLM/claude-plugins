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
