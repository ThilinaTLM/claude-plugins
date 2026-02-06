export function getInteractiveElements() {
	const elements: Array<{
		tag: string;
		type: string;
		text: string;
		placeholder: string;
		ariaLabel: string;
		name: string;
		id: string;
		href: string;
		bounds: { x: number; y: number; width: number; height: number };
	}> = [];

	const selectors = [
		// Core interactive elements
		"a[href]",
		"button",
		"input",
		"textarea",
		"select",
		// ARIA roles
		'[role="button"]',
		'[role="link"]',
		'[role="checkbox"]',
		'[role="radio"]',
		'[role="menuitem"]',
		'[role="tab"]',
		'[role="switch"]',
		'[role="option"]',
		'[role="slider"]',
		'[role="spinbutton"]',
		'[role="combobox"]',
		// Other interactive patterns
		"[onclick]",
		"[tabindex]:not([tabindex='-1'])",
		"[contenteditable='true']",
	];

	const seen = new Set<Element>();

	for (const selector of selectors) {
		for (const el of Array.from(document.querySelectorAll(selector))) {
			if (seen.has(el)) continue;
			seen.add(el);

			// Skip disabled elements
			if (
				(el as HTMLInputElement).disabled ||
				el.getAttribute("aria-disabled") === "true"
			)
				continue;

			const rect = el.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) continue;

			const text = (el.textContent || "").trim().slice(0, 100);
			const placeholder = el.getAttribute("placeholder") || "";
			const ariaLabel = el.getAttribute("aria-label") || "";
			const name = el.getAttribute("name") || "";
			const id = el.getAttribute("id") || "";
			const type = el.getAttribute("type") || "";
			const href = el.getAttribute("href") || "";

			elements.push({
				tag: el.tagName.toLowerCase(),
				type,
				text,
				placeholder,
				ariaLabel,
				name,
				id,
				href: href.slice(0, 200),
				bounds: {
					x: Math.round(rect.x),
					y: Math.round(rect.y),
					width: Math.round(rect.width),
					height: Math.round(rect.height),
				},
			});
		}
	}

	return { elements };
}
