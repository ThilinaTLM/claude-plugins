export function sendKey(key: string) {
	const keyMap: Record<string, { key: string; code: string; keyCode: number }> =
		{
			enter: { key: "Enter", code: "Enter", keyCode: 13 },
			tab: { key: "Tab", code: "Tab", keyCode: 9 },
			escape: { key: "Escape", code: "Escape", keyCode: 27 },
			backspace: { key: "Backspace", code: "Backspace", keyCode: 8 },
			delete: { key: "Delete", code: "Delete", keyCode: 46 },
			arrowup: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
			arrowdown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
			arrowleft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
			arrowright: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
			space: { key: " ", code: "Space", keyCode: 32 },
		};

	const keyInfo = keyMap[key.toLowerCase()] || {
		key,
		code: key,
		keyCode: 0,
	};
	const target = document.activeElement || document.body;

	target.dispatchEvent(
		new KeyboardEvent("keydown", { ...keyInfo, bubbles: true }),
	);
	target.dispatchEvent(
		new KeyboardEvent("keypress", { ...keyInfo, bubbles: true }),
	);
	target.dispatchEvent(
		new KeyboardEvent("keyup", { ...keyInfo, bubbles: true }),
	);

	return { sent: true, key };
}
