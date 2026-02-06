import { defineCommand } from "citty";
import { startNativeHost } from "../lib/native-host";

export const nativeHostCommand = defineCommand({
	meta: {
		name: "native-host",
		description:
			"[internal] Native messaging relay between CLI and browser extension",
	},
	run() {
		startNativeHost();
	},
});
