import browser from "webextension-polyfill";

interface JobDetectionMessage {
  type: string;
  data?: {
    isJobDescription: boolean;
    confidence: number;
    jobTitle?: string;
    companyName?: string;
    url: string;
  };
  tabId?: number;
}

// Store detection results per tab
const tabDetections = new Map<
  number,
  {
    isJobDescription: boolean;
    confidence: number;
    jobTitle?: string;
    companyName?: string;
    url: string;
  }
>();

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener(
  (message: unknown, sender: browser.Runtime.MessageSender) => {
    const msg = message as JobDetectionMessage;

    if (msg.type === "JOB_DETECTED" && sender.tab?.id && msg.data) {
      tabDetections.set(sender.tab.id, msg.data);

      // Update badge to indicate job detected
      browser.action.setBadgeText({
        text: "!",
        tabId: sender.tab.id,
      });
      browser.action.setBadgeBackgroundColor({
        color: "#10B981",
        tabId: sender.tab.id,
      });
      return;
    }

    if (msg.type === "GET_DETECTION" && msg.tabId !== undefined) {
      return Promise.resolve(tabDetections.get(msg.tabId) || null);
    }

    return false;
  }
);

// Clean up on tab close
browser.tabs.onRemoved.addListener((tabId: number) => {
  tabDetections.delete(tabId);
});

// Clear detection when tab navigates to a new page
browser.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
    if (changeInfo.status === "loading") {
      tabDetections.delete(tabId);
      browser.action.setBadgeText({ text: "", tabId });
    }
  }
);
