// WebNav Background Service Worker
// This is the brain of the extension - handles all command logic

const NATIVE_HOST_NAME = "com.tlmtech.webnav";

let nativePort = null;
let pendingRequests = new Map();
let isConnected = false;

// Connect to native host
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

  // Execute the command and send response
  executeCommand(action, payload)
    .then((result) => {
      sendResponse(id, true, result);
    })
    .catch((err) => {
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

// Command handlers
async function executeCommand(action, payload = {}) {
  switch (action) {
    case "screenshot":
      return await handleScreenshot(payload);
    case "goto":
      return await handleGoto(payload);
    case "info":
      return await handleInfo(payload);
    case "tabs":
      return await handleTabs(payload);
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
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Screenshot: capture visible tab
async function handleScreenshot(payload) {
  const tab = await getActiveTab();
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
  const { url } = payload;
  if (!url) {
    throw new Error("URL is required");
  }

  const tab = await getActiveTab();
  await chrome.tabs.update(tab.id, { url });

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

// Tabs: list all tabs
async function handleTabs(payload) {
  const tabs = await chrome.tabs.query({});
  return {
    tabs: tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      active: tab.active,
      windowId: tab.windowId,
    })),
  };
}

// Status: connection status
async function handleStatus(payload) {
  return {
    connected: true,
    version: chrome.runtime.getManifest().version,
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

// Helper: get active tab
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    throw new Error("No active tab found");
  }
  return tab;
}

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
    "a[href]",
    "button",
    "input",
    "textarea",
    "select",
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    "[onclick]",
  ];

  const seen = new Set();

  for (const selector of selectors) {
    for (const el of document.querySelectorAll(selector)) {
      if (seen.has(el)) continue;
      seen.add(el);

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

// Initialize connection on load
connectToNativeHost();
