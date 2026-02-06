export function fillInput(label: string, value: string) {
	// Try to find input by associated label
	const labels = Array.from(document.querySelectorAll("label"));
	for (const labelEl of labels) {
		if (labelEl.textContent?.toLowerCase().includes(label.toLowerCase())) {
			const input =
				(labelEl as HTMLLabelElement).control ||
				document.getElementById(labelEl.getAttribute("for") || "") ||
				labelEl.querySelector("input, textarea, select");
			if (input) {
				(input as HTMLElement).focus();
				(input as HTMLInputElement).value = value;
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
				return { filled: true, label, value };
			}
		}
	}

	// Try placeholder matching
	const inputs = Array.from(
		document.querySelectorAll("input, textarea"),
	) as HTMLInputElement[];
	for (const input of inputs) {
		const placeholder = input.getAttribute("placeholder") || "";
		const ariaLabel = input.getAttribute("aria-label") || "";
		const name = input.getAttribute("name") || "";

		if (
			placeholder.toLowerCase().includes(label.toLowerCase()) ||
			ariaLabel.toLowerCase().includes(label.toLowerCase()) ||
			name.toLowerCase().includes(label.toLowerCase())
		) {
			input.focus();
			input.value = value;
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
			return { filled: true, label, value };
		}
	}

	return { error: `No input found with label "${label}"` };
}
