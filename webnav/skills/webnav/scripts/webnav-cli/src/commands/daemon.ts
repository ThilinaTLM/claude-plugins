import { defineCommand } from "citty";
import { startNativeHost } from "../lib/native-host";

export const daemonCommand = defineCommand({
	meta: {
		name: "daemon",
		description: "Run as native messaging host (called by Chrome)",
	},
	run() {
		startNativeHost();
	},
});
