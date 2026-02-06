export function waitForElement({
	text,
	selector,
	timeout,
}: { text?: string; selector?: string; timeout: number }) {
	return new Promise<{ found?: boolean; error?: string }>((resolve) => {
		const startTime = Date.now();

		const check = () => {
			let found = false;

			if (selector) {
				found = document.querySelector(selector) !== null;
			} else if (text) {
				found = document.body.textContent?.includes(text) ?? false;
			}

			if (found) {
				resolve({ found: true });
				return;
			}

			if (Date.now() - startTime > timeout) {
				resolve({
					error: `Timeout waiting for ${text ? `text "${text}"` : `selector "${selector}"`}`,
				});
				return;
			}

			setTimeout(check, 100);
		};

		check();
	});
}
