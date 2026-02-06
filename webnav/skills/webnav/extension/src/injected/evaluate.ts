export async function evaluateExpression({
	expression,
}: { expression: string }) {
	try {
		const fn = new Function(
			`return (async () => { return (${expression}) })()`,
		) as () => Promise<unknown>;
		const raw = await fn();

		let result: unknown;
		let type: string = typeof raw;

		if (raw === null) {
			result = null;
			type = "null";
		} else if (raw === undefined) {
			result = undefined;
			type = "undefined";
		} else if (raw instanceof Element) {
			result = `<${raw.tagName.toLowerCase()}${raw.id ? ` id="${raw.id}"` : ""}>`;
			type = "element";
		} else if (typeof raw === "function") {
			result = raw.toString().slice(0, 200);
			type = "function";
		} else {
			try {
				JSON.stringify(raw);
				result = raw;
			} catch {
				result = String(raw);
			}
		}

		return { result, type };
	} catch (err) {
		return { error: (err as Error).message };
	}
}
