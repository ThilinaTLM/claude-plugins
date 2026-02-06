export function getElementBounds({ selector }: { selector: string }) {
	const element = document.querySelector(selector);
	if (!element) {
		return { error: `Element not found for selector "${selector}"` };
	}

	const rect = element.getBoundingClientRect();
	return {
		x: rect.x + window.scrollX,
		y: rect.y + window.scrollY,
		width: rect.width,
		height: rect.height,
		scale: window.devicePixelRatio,
	};
}
