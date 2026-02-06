declare global {
	interface Window {
		__webnavRefMap?: Map<string, Element>;
	}
}

const IMPLICIT_ROLES: Record<string, string> = {
	A: "link",
	ARTICLE: "article",
	ASIDE: "complementary",
	BUTTON: "button",
	DETAILS: "group",
	DIALOG: "dialog",
	FOOTER: "contentinfo",
	FORM: "form",
	H1: "heading",
	H2: "heading",
	H3: "heading",
	H4: "heading",
	H5: "heading",
	H6: "heading",
	HEADER: "banner",
	HR: "separator",
	IMG: "img",
	INPUT: "textbox",
	LI: "listitem",
	MAIN: "main",
	NAV: "navigation",
	OL: "list",
	OPTION: "option",
	PROGRESS: "progressbar",
	SECTION: "region",
	SELECT: "combobox",
	TABLE: "table",
	TD: "cell",
	TEXTAREA: "textbox",
	TH: "columnheader",
	TR: "row",
	UL: "list",
};

const INPUT_ROLE_MAP: Record<string, string> = {
	checkbox: "checkbox",
	radio: "radio",
	range: "slider",
	search: "searchbox",
	email: "textbox",
	tel: "textbox",
	url: "textbox",
	number: "spinbutton",
	submit: "button",
	reset: "button",
	button: "button",
};

const INTERACTIVE_ROLES = new Set([
	"button",
	"link",
	"textbox",
	"checkbox",
	"radio",
	"combobox",
	"slider",
	"spinbutton",
	"searchbox",
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio",
	"tab",
	"switch",
	"option",
]);

interface SnapshotNode {
	ref: string;
	role: string;
	name: string;
	tag: string;
	states?: Record<string, unknown>;
	children?: SnapshotNode[];
}

function getRole(el: Element): string {
	const explicit = el.getAttribute("role");
	if (explicit) return explicit;

	if (el.tagName === "INPUT") {
		const type = (el as HTMLInputElement).type?.toLowerCase() || "text";
		return INPUT_ROLE_MAP[type] || "textbox";
	}

	return IMPLICIT_ROLES[el.tagName] || "generic";
}

function getAccessibleName(el: Element): string {
	const ariaLabel = el.getAttribute("aria-label");
	if (ariaLabel) return ariaLabel;

	const labelledBy = el.getAttribute("aria-labelledby");
	if (labelledBy) {
		const parts = labelledBy
			.split(/\s+/)
			.map((id) => document.getElementById(id)?.textContent?.trim())
			.filter(Boolean);
		if (parts.length) return parts.join(" ");
	}

	if (
		el.tagName === "INPUT" ||
		el.tagName === "SELECT" ||
		el.tagName === "TEXTAREA"
	) {
		const id = el.getAttribute("id");
		if (id) {
			const label = document.querySelector(`label[for="${id}"]`);
			if (label) return label.textContent?.trim() || "";
		}
	}

	if (el.tagName === "IMG") {
		const alt = el.getAttribute("alt");
		if (alt) return alt;
	}

	const title = el.getAttribute("title");
	if (title) return title;

	const text = el.textContent?.trim() || "";
	return text.slice(0, 200);
}

function getStates(el: Element): Record<string, unknown> | undefined {
	const states: Record<string, unknown> = {};
	const html = el as HTMLInputElement;

	if (html.checked !== undefined && html.type) {
		const type = html.type.toLowerCase();
		if (type === "checkbox" || type === "radio") {
			states.checked = html.checked;
		}
	}

	if (html.disabled !== undefined && html.disabled) {
		states.disabled = true;
	}

	if (html.required !== undefined && html.required) {
		states.required = true;
	}

	if (html.readOnly !== undefined && html.readOnly) {
		states.readonly = true;
	}

	if (html.value !== undefined && html.tagName !== "BUTTON") {
		const tag = html.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
			states.value = html.value;
		}
	}

	const expanded = el.getAttribute("aria-expanded");
	if (expanded !== null) states.expanded = expanded === "true";

	const selected = el.getAttribute("aria-selected");
	if (selected !== null) states.selected = selected === "true";

	return Object.keys(states).length > 0 ? states : undefined;
}

function isHidden(el: Element): boolean {
	const style = getComputedStyle(el);
	if (style.display === "none" || style.visibility === "hidden") return true;
	const rect = el.getBoundingClientRect();
	if (rect.width === 0 && rect.height === 0) return true;
	return false;
}

function formatCompact(nodes: SnapshotNode[], indent: number): string {
	const lines: string[] = [];
	for (const node of nodes) {
		const prefix = "  ".repeat(indent);
		let line = `${prefix}${node.ref} ${node.role}`;
		if (node.name) line += ` "${node.name}"`;
		if (node.states) {
			const s = Object.entries(node.states)
				.map(([k, v]) => `${k}=${v}`)
				.join(" ");
			line += ` [${s}]`;
		}
		lines.push(line);
		if (node.children) {
			lines.push(formatCompact(node.children, indent + 1));
		}
	}
	return lines.join("\n");
}

export function takeSnapshot({
	interactive = false,
	selector,
	maxDepth,
	compact = false,
}: {
	interactive?: boolean;
	selector?: string;
	maxDepth?: number;
	compact?: boolean;
} = {}) {
	const root = selector ? document.querySelector(selector) : document.body;

	if (!root) {
		return { error: `Root element not found for selector "${selector}"` };
	}

	const refMap = new Map<string, Element>();
	let refCounter = 0;
	const cap = 5000;

	function walk(parent: Element, depth: number): SnapshotNode[] {
		const nodes: SnapshotNode[] = [];

		for (const child of Array.from(parent.children)) {
			if (refCounter >= cap) break;
			if (isHidden(child)) continue;
			if (maxDepth !== undefined && depth > maxDepth) continue;

			const role = getRole(child);

			const isInteractive = INTERACTIVE_ROLES.has(role);
			const hasExplicitRole = child.hasAttribute("role") || role !== "generic";

			const childNodes = walk(child, depth + 1);

			if (interactive && !isInteractive && childNodes.length === 0) {
				continue;
			}

			if (
				!interactive &&
				!hasExplicitRole &&
				childNodes.length === 0 &&
				!child.textContent?.trim()
			) {
				continue;
			}

			refCounter++;
			const ref = `@e${refCounter}`;
			refMap.set(ref, child);

			const node: SnapshotNode = {
				ref,
				role,
				name: getAccessibleName(child),
				tag: child.tagName.toLowerCase(),
				states: getStates(child),
			};

			if (childNodes.length > 0) {
				node.children = childNodes;
			}

			nodes.push(node);
		}

		return nodes;
	}

	const tree = walk(root, 0);
	window.__webnavRefMap = refMap;

	if (compact) {
		return {
			tree: formatCompact(tree, 0),
			nodeCount: refCounter,
			compact: true,
		};
	}

	return { tree, nodeCount: refCounter };
}
