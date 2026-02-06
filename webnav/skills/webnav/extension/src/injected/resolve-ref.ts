declare global {
	interface Window {
		__webnavRefMap?: Map<string, Element>;
	}
}

export function resolveRef({ ref }: { ref: string }) {
	if (!window.__webnavRefMap) {
		return {
			error: "No snapshot taken yet. Run 'webnav snapshot' first.",
		};
	}

	const element = window.__webnavRefMap.get(ref);
	if (!element) {
		return {
			error: `Ref "${ref}" not found. It may be stale — run 'webnav snapshot' again.`,
		};
	}

	// Tag the element with a data attribute so other commands can target it
	const attr = "data-webnav-ref";
	element.setAttribute(attr, ref);

	return {
		resolved: true,
		ref,
		selector: `[${attr}="${ref}"]`,
		tag: element.tagName.toLowerCase(),
	};
}
