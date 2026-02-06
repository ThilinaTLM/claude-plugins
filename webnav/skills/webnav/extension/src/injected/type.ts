export function typeText(text: string) {
	const activeElement = document.activeElement as HTMLInputElement | null;
	if (!activeElement || !("value" in activeElement)) {
		return { error: "No input element is focused" };
	}

	// Simulate typing
	activeElement.value = text;
	activeElement.dispatchEvent(new Event("input", { bubbles: true }));
	activeElement.dispatchEvent(new Event("change", { bubbles: true }));

	return { typed: true, value: text };
}
