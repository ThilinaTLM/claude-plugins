import { connectToNativeHost } from "./native-messaging";
import { restoreState } from "./state";
import "./tabs"; // Register event listeners

// Initialize: restore state then connect
restoreState().then(() => connectToNativeHost());
