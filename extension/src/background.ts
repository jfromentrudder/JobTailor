import browser from "webextension-polyfill";

interface DetectionMessage {
  type: string;
  data?: {
    isJobDescription?: boolean;
    isApplicationForm?: boolean;
    confidence: number;
    jobTitle?: string;
    companyName?: string;
    fieldCount?: number;
    fieldTypes?: string[];
    url: string;
  };
  tabId?: number;
}

interface TabDetectionState {
  isJobDescription: boolean;
  confidence: number;
  jobTitle?: string;
  companyName?: string;
  url: string;
  isApplicationForm?: boolean;
  applicationConfidence?: number;
  fieldCount?: number;
  fieldTypes?: string[];
}

// Store detection results per tab
const tabDetections = new Map<number, TabDetectionState>();

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener(
  (message: unknown, sender: browser.Runtime.MessageSender) => {
    const msg = message as DetectionMessage;

    if (msg.type === "JOB_DETECTED" && sender.tab?.id && msg.data) {
      const existing = tabDetections.get(sender.tab.id);
      tabDetections.set(sender.tab.id, {
        ...existing,
        isJobDescription: true,
        confidence: msg.data.confidence,
        jobTitle: msg.data.jobTitle,
        companyName: msg.data.companyName,
        url: msg.data.url,
      });

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

    if (msg.type === "APPLICATION_DETECTED" && sender.tab?.id && msg.data) {
      const existing = tabDetections.get(sender.tab.id);
      tabDetections.set(sender.tab.id, {
        isJobDescription: existing?.isJobDescription || false,
        confidence: existing?.confidence || 0,
        jobTitle: existing?.jobTitle,
        companyName: existing?.companyName,
        url: msg.data.url,
        isApplicationForm: true,
        applicationConfidence: msg.data.confidence,
        fieldCount: msg.data.fieldCount,
        fieldTypes: msg.data.fieldTypes,
      });

      // Show blue "A" badge for application forms (only if no job detected badge)
      if (!existing?.isJobDescription) {
        browser.action.setBadgeText({
          text: "A",
          tabId: sender.tab.id,
        });
        browser.action.setBadgeBackgroundColor({
          color: "#2563EB",
          tabId: sender.tab.id,
        });
      }
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
