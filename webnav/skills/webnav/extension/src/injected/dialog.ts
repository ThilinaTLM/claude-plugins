export function setupDialog({
	action,
	text,
}: { action: "accept" | "dismiss"; text?: string }) {
	const w = window as Window & {
		__webnavOrigAlert?: typeof alert;
		__webnavOrigConfirm?: typeof confirm;
		__webnavOrigPrompt?: typeof prompt;
	};

	// Store originals if not already stored
	if (!w.__webnavOrigAlert) w.__webnavOrigAlert = window.alert;
	if (!w.__webnavOrigConfirm) w.__webnavOrigConfirm = window.confirm;
	if (!w.__webnavOrigPrompt) w.__webnavOrigPrompt = window.prompt;

	window.alert = () => {};

	window.confirm = () => action === "accept";

	window.prompt = () => (action === "accept" ? (text ?? "") : null);

	return {
		configured: true,
		action,
		text: text ?? null,
	};
}
