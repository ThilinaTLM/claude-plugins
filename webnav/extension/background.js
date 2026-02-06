// WebNav Background Service Worker
// This is the brain of the extension - handles all command logic

const NATIVE_HOST_NAME = "com.tlmtech.webnav";
const WEBNAV_GROUP_NAME = "webnav";
const WEBNAV_GROUP_COLOR = "cyan";
const MAX_HISTORY_SIZE = 200;

let nativePort = null;
let pendingRequests = new Map();
let isConnected = false;

// Tab group state
let webnavGroupId = null;
let activeWebnavTabId = null;
let commandHistory = [];

// ============================================
// Session storage persistence
// ============================================

async function persistState() {
  try {
    await chrome.storage.session.set({
      webnavGroupId,
      activeWebnavTabId,
      commandHistory,
    });
  } catch (err) {
    console.warn("[WebNav] Failed to persist state:", err);
  }
}

async function restoreState() {
  try {
    const stored = await chrome.storage.session.get([
      "webnavGroupId",
      "activeWebnavTabId",
      "commandHistory",
    ]);

    commandHistory = stored.commandHistory || [];

    // Validate group still exists
    if (stored.webnavGroupId != null) {
      try {
        const group = await chrome.tabGroups.get(stored.webnavGroupId);
        if (group) {
          webnavGroupId = stored.webnavGroupId;
        }
      } catch {
        webnavGroupId = null;
      }
    }

    // Validate tab still exists and belongs to group
    if (stored.activeWebnavTabId != null && webnavGroupId != null) {
      try {
        const tab = await chrome.tabs.get(stored.activeWebnavTabId);
        if (tab && tab.groupId === webnavGroupId) {
          activeWebnavTabId = stored.activeWebnavTabId;
        } else {
          activeWebnavTabId = null;
        }
      } catch {
        activeWebnavTabId = null;
      }
    }

    console.log("[WebNav] State restored:", {
      webnavGroupId,
      activeWebnavTabId,
      historySize: commandHistory.length,
    });
  } catch (err) {
    console.warn("[WebNav] Failed to restore state:", err);
  }
}

// ============================================
// Event listeners for external mutations
// ============================================

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeWebnavTabId) {
    console.log("[WebNav] Active webnav tab closed, auto-selecting another");
    activeWebnavTabId = null;
    await autoSelectActiveTab();
    await persistState();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (tabId === activeWebnavTabId && changeInfo.groupId !== undefined) {
    if (changeInfo.groupId !== webnavGroupId) {
      console.log("[WebNav] Active tab removed from group, auto-selecting another");
      activeWebnavTabId = null;
      await autoSelectActiveTab();
      await persistState();
    }
  }
});

chrome.tabGroups.onRemoved.addListener(async (group) => {
  if (group.id === webnavGroupId) {
    console.log("[WebNav] Webnav group deleted, clearing state");
    webnavGroupId = null;
    activeWebnavTabId = null;
    await persistState();
  }
});

// ============================================
// Tab group helpers
// ============================================

async function ensureWebnavGroup() {
  // Check if current group ID is still valid
  if (webnavGroupId != null) {
    try {
      await chrome.tabGroups.get(webnavGroupId);
      return webnavGroupId;
    } catch {
      webnavGroupId = null;
    }
  }

  // Search for existing webnav group by title
  const allGroups = await chrome.tabGroups.query({ title: WEBNAV_GROUP_NAME });
  if (allGroups.length > 0) {
    webnavGroupId = allGroups[0].id;
    await persistState();
    return webnavGroupId;
  }

  // No existing group — will be created when a tab is added
  return null;
}

async function createWebnavGroupWithTab(tabId) {
  const groupId = await chrome.tabs.group({ tabIds: [tabId] });
  await chrome.tabGroups.update(groupId, {
    title: WEBNAV_GROUP_NAME,
    color: WEBNAV_GROUP_COLOR,
    collapsed: false,
  });
  webnavGroupId = groupId;
  await persistState();
  return groupId;
}

async function addTabToGroup(tabId) {
  await ensureWebnavGroup();
  if (webnavGroupId != null) {
    await chrome.tabs.group({ tabIds: [tabId], groupId: webnavGroupId });
  } else {
    await createWebnavGroupWithTab(tabId);
  }
}

async function autoSelectActiveTab() {
  if (webnavGroupId == null) return;

  try {
    const tabs = await chrome.tabs.query({ groupId: webnavGroupId });
    if (tabs.length > 0) {
      activeWebnavTabId = tabs[0].id;
    } else {
      activeWebnavTabId = null;
    }
    await persistState();
  } catch {
    activeWebnavTabId = null;
  }
}

async function getGroupTabCount() {
  if (webnavGroupId == null) return 0;
  try {
    const tabs = await chrome.tabs.query({ groupId: webnavGroupId });
    return tabs.length;
  } catch {
    return 0;
  }
}

// ============================================
// Connection and messaging
// ============================================

function connectToNativeHost() {
  if (nativePort) {
    return;
  }

  try {
    nativePort = chrome.runtime.connectNative(NATIVE_HOST_NAME);
    isConnected = true;
    console.log("[WebNav] Connected to native host");

    nativePort.onMessage.addListener((message) => {
      console.log("[WebNav] Received from native host:", message);
      handleNativeMessage(message);
    });

    nativePort.onDisconnect.addListener(() => {
      const error = chrome.runtime.lastError?.message || "Unknown error";
      console.log("[WebNav] Disconnected from native host:", error);
      nativePort = null;
      isConnected = false;

      // Reject all pending requests
      for (const [id, { reject }] of pendingRequests) {
        reject(new Error("Native host disconnected: " + error));
      }
      pendingRequests.clear();

      // Try to reconnect after a delay
      setTimeout(connectToNativeHost, 5000);
    });
  } catch (err) {
    console.error("[WebNav] Failed to connect to native host:", err);
    isConnected = false;
  }
}

// Handle incoming messages from native host
function handleNativeMessage(message) {
  const { id, action, payload } = message;

  if (!id) {
    console.error("[WebNav] Message missing id:", message);
    return;
  }

  const startTime = Date.now();

  // Execute the command and send response
  executeCommand(action, payload)
    .then((result) => {
      recordHistory(action, payload, true, result, startTime);
      sendResponse(id, true, result);
    })
    .catch((err) => {
      recordHistory(action, payload, false, null, startTime, err.message);
      sendResponse(id, false, null, err.message);
    });
}

// Send response back to native host
function sendResponse(id, ok, data, error = null) {
  if (!nativePort) {
    console.error("[WebNav] Cannot send response - not connected");
    return;
  }

  const response = { id, ok };
  if (ok) {
    response.data = data;
  } else {
    response.error = error;
  }

  console.log("[WebNav] Sending response:", response);
  nativePort.postMessage(response);
}

// ============================================
// Command history
// ============================================

function recordHistory(action, payload, ok, result, startTime, error = null) {
  const entry = {
    action,
    payload: sanitizePayload(payload),
    ok,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };

  if (ok && result) {
    entry.result = sanitizeResult(action, result);
  }
  if (error) {
    entry.error = error;
  }

  commandHistory.push(entry);
  if (commandHistory.length > MAX_HISTORY_SIZE) {
    commandHistory = commandHistory.slice(-MAX_HISTORY_SIZE);
  }

  persistState();
}

function sanitizePayload(payload) {
  if (!payload) return {};
  // Payload is typically small, return as-is
  return { ...payload };
}

function sanitizeResult(action, result) {
  if (!result) return result;
  const sanitized = { ...result };

  // Omit large base64 screenshot data
  if (sanitized.image) {
    sanitized.image = undefined;
    sanitized.hasImage = true;
  }

  // Summarize large element arrays
  if (sanitized.elements && Array.isArray(sanitized.elements)) {
    sanitized.elements = undefined;
    sanitized.elementCount = result.elements.length;
  }

  return sanitized;
}

// ============================================
// Command handlers
// ============================================

async function executeCommand(action, payload = {}) {
  switch (action) {
    case "screenshot":
      return await handleScreenshot(payload);
    case "goto":
      return await handleGoto(payload);
    case "info":
      return await handleInfo(payload);
    case "status":
      return await handleStatus(payload);
    case "click":
      return await handleClick(payload);
    case "type":
      return await handleType(payload);
    case "key":
      return await handleKey(payload);
    case "fill":
      return await handleFill(payload);
    case "wait-for":
      return await handleWaitFor(payload);
    case "elements":
      return await handleElements(payload);
    case "group-tabs":
      return await handleGroupTabs(payload);
    case "group-switch":
      return await handleGroupSwitch(payload);
    case "group-add":
      return await handleGroupAdd(payload);
    case "group-remove":
      return await handleGroupRemove(payload);
    case "group-close":
      return await handleGroupClose(payload);
    case "history":
      return await handleHistory(payload);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// ============================================
// Core tab resolution (replaces old getActiveTab)
// ============================================

async function getActiveTab() {
  // 1. Ensure the webnav group exists
  await ensureWebnavGroup();

  // 2. If we have a tracked active tab, validate it
  if (activeWebnavTabId != null) {
    try {
      const tab = await chrome.tabs.get(activeWebnavTabId);
      if (tab && tab.groupId === webnavGroupId) {
        return tab;
      }
    } catch {
      // Tab no longer exists
    }
    activeWebnavTabId = null;
  }

  // 3. Try to find a tab in the group
  if (webnavGroupId != null) {
    const tabs = await chrome.tabs.query({ groupId: webnavGroupId });
    if (tabs.length > 0) {
      activeWebnavTabId = tabs[0].id;
      await persistState();
      return tabs[0];
    }
  }

  // 4. No group or empty group — create a new blank tab and group it
  const newTab = await chrome.tabs.create({ url: "about:blank", active: true });
  await createWebnavGroupWithTab(newTab.id);
  activeWebnavTabId = newTab.id;
  await persistState();
  return newTab;
}

// ============================================
// Screenshot: capture visible tab
// ============================================

async function handleScreenshot(payload) {
  const tab = await getActiveTab();

  // Ensure the tab is active/visible so captureVisibleTab works
  await chrome.tabs.update(tab.id, { active: true });
  // Brief delay to let the browser paint
  await new Promise((resolve) => setTimeout(resolve, 100));

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "png",
  });
  return {
    image: dataUrl,
    url: tab.url,
    title: tab.title,
  };
}

// Goto: navigate to URL
async function handleGoto(payload) {
  const { url, newTab } = payload;
  if (!url) {
    throw new Error("URL is required");
  }

  let tab;
  if (newTab) {
    // Create a new tab in the webnav group
    await ensureWebnavGroup();
    tab = await chrome.tabs.create({ url, active: true });
    await addTabToGroup(tab.id);
    activeWebnavTabId = tab.id;
    await persistState();
  } else {
    tab = await getActiveTab();
    await chrome.tabs.update(tab.id, { url });
  }

  // Wait for page to load
  await waitForTabLoad(tab.id);

  const updatedTab = await chrome.tabs.get(tab.id);
  return {
    url: updatedTab.url,
    title: updatedTab.title,
  };
}

// Info: get current tab info
async function handleInfo(payload) {
  const tab = await getActiveTab();
  return {
    id: tab.id,
    url: tab.url,
    title: tab.title,
    status: tab.status,
    active: tab.active,
    windowId: tab.windowId,
  };
}

// Status: connection status (enhanced with group info)
async function handleStatus(payload) {
  const tabCount = await getGroupTabCount();
  return {
    connected: true,
    version: chrome.runtime.getManifest().version,
    group: {
      groupId: webnavGroupId,
      activeTabId: activeWebnavTabId,
      tabCount,
    },
    historyCount: commandHistory.length,
  };
}

// Click: click element by text or selector
async function handleClick(payload) {
  const { text, selector, index } = payload;
  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: clickElement,
    args: [{ text, selector, index }],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { clicked: true };
}

// Type: type text into focused element
async function handleType(payload) {
  const { text } = payload;
  if (!text) {
    throw new Error("Text is required");
  }

  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: typeText,
    args: [text],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { typed: true };
}

// Key: send keyboard event
async function handleKey(payload) {
  const { key } = payload;
  if (!key) {
    throw new Error("Key is required");
  }

  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: sendKey,
    args: [key],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { sent: true };
}

// Fill: find input by label and fill value
async function handleFill(payload) {
  const { label, value } = payload;
  if (!label || value === undefined) {
    throw new Error("Label and value are required");
  }

  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fillInput,
    args: [label, value],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { filled: true };
}

// Wait for element
async function handleWaitFor(payload) {
  const { text, selector, timeout = 10000 } = payload;
  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: waitForElement,
    args: [{ text, selector, timeout }],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { found: true };
}

// Elements: list interactive elements
async function handleElements(payload) {
  const tab = await getActiveTab();

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getInteractiveElements,
    args: [],
  });

  if (result[0]?.result?.error) {
    throw new Error(result[0].result.error);
  }

  return result[0]?.result || { elements: [] };
}

// ============================================
// Tab group command handlers
// ============================================

async function handleGroupTabs(payload) {
  await ensureWebnavGroup();

  if (webnavGroupId == null) {
    return { tabs: [], activeTabId: null };
  }

  const tabs = await chrome.tabs.query({ groupId: webnavGroupId });
  return {
    tabs: tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      active: tab.id === activeWebnavTabId,
      windowId: tab.windowId,
    })),
    activeTabId: activeWebnavTabId,
  };
}

async function handleGroupSwitch(payload) {
  const { tabId } = payload;
  if (tabId == null) {
    throw new Error("tabId is required");
  }

  await ensureWebnavGroup();

  // Verify tab exists and belongs to group
  const tab = await chrome.tabs.get(tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found`);
  }
  if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
    throw new Error(`Tab ${tabId} is not in the webnav group`);
  }

  activeWebnavTabId = tabId;
  await chrome.tabs.update(tabId, { active: true });
  await persistState();

  return {
    activeTabId: tabId,
    url: tab.url,
    title: tab.title,
  };
}

async function handleGroupAdd(payload) {
  let { tabId } = payload;

  // If no tabId specified, use browser's currently active tab
  if (tabId == null) {
    const [browserTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!browserTab) {
      throw new Error("No active browser tab found");
    }
    tabId = browserTab.id;
  }

  const tab = await chrome.tabs.get(tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found`);
  }

  await addTabToGroup(tabId);
  activeWebnavTabId = tabId;
  await persistState();

  return {
    tabId,
    url: tab.url,
    title: tab.title,
    groupId: webnavGroupId,
  };
}

async function handleGroupRemove(payload) {
  const { tabId } = payload;
  if (tabId == null) {
    throw new Error("tabId is required");
  }

  await ensureWebnavGroup();

  const tab = await chrome.tabs.get(tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found`);
  }
  if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
    throw new Error(`Tab ${tabId} is not in the webnav group`);
  }

  // Ungroup the tab (keeps it open)
  await chrome.tabs.ungroup(tabId);

  // If it was the active tab, auto-select another
  if (tabId === activeWebnavTabId) {
    activeWebnavTabId = null;
    await autoSelectActiveTab();
  }

  await persistState();

  return {
    tabId,
    url: tab.url,
    title: tab.title,
    removed: true,
  };
}

async function handleGroupClose(payload) {
  const { tabId } = payload;
  if (tabId == null) {
    throw new Error("tabId is required");
  }

  await ensureWebnavGroup();

  const tab = await chrome.tabs.get(tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found`);
  }
  if (webnavGroupId != null && tab.groupId !== webnavGroupId) {
    throw new Error(`Tab ${tabId} is not in the webnav group`);
  }

  const closedUrl = tab.url;
  const closedTitle = tab.title;

  await chrome.tabs.remove(tabId);

  // onRemoved listener handles auto-select, but ensure state is clean
  if (tabId === activeWebnavTabId) {
    activeWebnavTabId = null;
    await autoSelectActiveTab();
  }

  await persistState();

  return {
    tabId,
    url: closedUrl,
    title: closedTitle,
    closed: true,
  };
}

// ============================================
// History command handler
// ============================================

async function handleHistory(payload) {
  const { limit = 50, offset = 0 } = payload;

  const total = commandHistory.length;
  // Slice from the end (newest last)
  const start = Math.max(0, total - offset - limit);
  const end = Math.max(0, total - offset);
  const entries = commandHistory.slice(start, end);

  return {
    entries,
    total,
    limit,
    offset,
  };
}

// ============================================
// Helpers
// ============================================

// Helper: wait for tab to finish loading
function waitForTabLoad(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // Timeout
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve(); // Resolve anyway after timeout
    }, timeout);
  });
}

// ============================================
// Functions injected into page context
// ============================================

function clickElement({ text, selector, index = 0 }) {
  let elements = [];

  if (selector) {
    elements = Array.from(document.querySelectorAll(selector));
  } else if (text) {
    // Find elements containing text
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.includes(text)) {
        textNodes.push(walker.currentNode);
      }
    }

    // Get clickable parent elements
    for (const node of textNodes) {
      let el = node.parentElement;
      while (el && el !== document.body) {
        const clickable =
          el.tagName === "A" ||
          el.tagName === "BUTTON" ||
          el.onclick ||
          el.getAttribute("role") === "button" ||
          getComputedStyle(el).cursor === "pointer";
        if (clickable) {
          elements.push(el);
          break;
        }
        el = el.parentElement;
      }
      if (el === document.body && node.parentElement) {
        elements.push(node.parentElement);
      }
    }
  }

  if (elements.length === 0) {
    return { error: `No element found matching ${text ? `text "${text}"` : `selector "${selector}"`}` };
  }

  const element = elements[index];
  if (!element) {
    return { error: `Index ${index} out of range (found ${elements.length} elements)` };
  }

  element.scrollIntoView({ behavior: "instant", block: "center" });
  element.click();

  return {
    clicked: true,
    tag: element.tagName.toLowerCase(),
    text: element.textContent?.slice(0, 100),
  };
}

function typeText(text) {
  const activeElement = document.activeElement;
  if (!activeElement || !("value" in activeElement)) {
    return { error: "No input element is focused" };
  }

  // Simulate typing
  activeElement.value = text;
  activeElement.dispatchEvent(new Event("input", { bubbles: true }));
  activeElement.dispatchEvent(new Event("change", { bubbles: true }));

  return { typed: true, value: text };
}

function sendKey(key) {
  const keyMap = {
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

  const keyInfo = keyMap[key.toLowerCase()] || { key, code: key, keyCode: 0 };
  const target = document.activeElement || document.body;

  target.dispatchEvent(
    new KeyboardEvent("keydown", { ...keyInfo, bubbles: true })
  );
  target.dispatchEvent(
    new KeyboardEvent("keypress", { ...keyInfo, bubbles: true })
  );
  target.dispatchEvent(
    new KeyboardEvent("keyup", { ...keyInfo, bubbles: true })
  );

  return { sent: true, key };
}

function fillInput(label, value) {
  // Try to find input by associated label
  const labels = Array.from(document.querySelectorAll("label"));
  for (const labelEl of labels) {
    if (labelEl.textContent.toLowerCase().includes(label.toLowerCase())) {
      const input =
        labelEl.control ||
        document.getElementById(labelEl.getAttribute("for")) ||
        labelEl.querySelector("input, textarea, select");
      if (input) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return { filled: true, label, value };
      }
    }
  }

  // Try placeholder matching
  const inputs = Array.from(
    document.querySelectorAll("input, textarea")
  );
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

function waitForElement({ text, selector, timeout }) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = () => {
      let found = false;

      if (selector) {
        found = document.querySelector(selector) !== null;
      } else if (text) {
        found = document.body.textContent.includes(text);
      }

      if (found) {
        resolve({ found: true });
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve({ error: `Timeout waiting for ${text ? `text "${text}"` : `selector "${selector}"`}` });
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
}

function getInteractiveElements() {
  const elements = [];
  const selectors = [
    // Core interactive elements
    "a[href]",
    "button",
    "input",
    "textarea",
    "select",
    // ARIA roles
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="menuitem"]',
    '[role="tab"]',
    '[role="switch"]',
    '[role="option"]',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="combobox"]',
    // Other interactive patterns
    "[onclick]",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
  ];

  const seen = new Set();

  for (const selector of selectors) {
    for (const el of document.querySelectorAll(selector)) {
      if (seen.has(el)) continue;
      seen.add(el);

      // Skip disabled elements
      if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const text = (el.textContent || "").trim().slice(0, 100);
      const placeholder = el.getAttribute("placeholder") || "";
      const ariaLabel = el.getAttribute("aria-label") || "";
      const name = el.getAttribute("name") || "";
      const id = el.getAttribute("id") || "";
      const type = el.getAttribute("type") || "";
      const href = el.getAttribute("href") || "";

      elements.push({
        tag: el.tagName.toLowerCase(),
        type,
        text,
        placeholder,
        ariaLabel,
        name,
        id,
        href: href.slice(0, 200),
        bounds: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
    }
  }

  return { elements };
}

// Initialize: restore state then connect
restoreState().then(() => connectToNativeHost());
