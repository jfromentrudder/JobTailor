import browser from "webextension-polyfill";

const APP_URL = "http://localhost:3000";

const states = [
  "loading",
  "not-logged-in",
  "no-job",
  "job-detected",
  "tailoring",
  "success",
  "error",
];

function showState(state: string) {
  for (const s of states) {
    const el = document.getElementById(s);
    if (el) el.classList.toggle("hidden", s !== state);
  }
}

let currentPageData: {
  jobTitle?: string;
  companyName?: string;
  jobDescriptionText?: string;
  url?: string;
  pageText?: string;
} = {};

async function init() {
  // Check auth
  const { accessToken } = await browser.storage.local.get("accessToken");
  if (!accessToken) {
    showState("not-logged-in");
    return;
  }

  // Get current tab
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];
  if (!tab?.id) {
    showState("no-job");
    return;
  }

  // Check for detection from background
  const detection = await browser.runtime.sendMessage({
    type: "GET_DETECTION",
    tabId: tab.id,
  });

  if (detection?.isJobDescription) {
    const titleEl = document.getElementById("job-title");
    const companyEl = document.getElementById("company-name");
    if (titleEl) titleEl.textContent = detection.jobTitle || "Job Detected";
    if (companyEl)
      companyEl.textContent = detection.companyName || "";

    currentPageData = {
      jobTitle: detection.jobTitle,
      companyName: detection.companyName,
      url: detection.url,
    };

    showState("job-detected");
  } else {
    showState("no-job");
  }
}

// Tailor button
document.getElementById("tailor-btn")?.addEventListener("click", async () => {
  showState("tailoring");

  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];
  if (!tab?.id) {
    showError("No active tab found");
    return;
  }

  // Get full page data from content script
  try {
    const pageData = await browser.tabs.sendMessage(tab.id, {
      type: "GET_PAGE_DATA",
    });

    currentPageData = { ...currentPageData, ...pageData };

    const { accessToken } = await browser.storage.local.get("accessToken");

    const response = await fetch(`${APP_URL}/api/tailor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        job_description_text:
          currentPageData.jobDescriptionText || currentPageData.pageText || "",
        job_title: currentPageData.jobTitle || "Unknown Position",
        company_name: currentPageData.companyName,
        job_url: currentPageData.url,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showError(result.error || "Request failed");
      return;
    }

    const viewLink = document.getElementById(
      "view-link"
    ) as HTMLAnchorElement;
    if (viewLink) {
      viewLink.href = `${APP_URL}/dashboard/resumes/${result.id}`;
    }
    showState("success");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong";
    showError(message);
  }
});

// Login button
document.getElementById("login-btn")?.addEventListener("click", () => {
  browser.tabs.create({ url: `${APP_URL}/extension/connect` });
});

// Retry button
document.getElementById("retry-btn")?.addEventListener("click", () => {
  init();
});

function showError(message: string) {
  const errorMsg = document.getElementById("error-message");
  if (errorMsg) errorMsg.textContent = message;
  showState("error");
}

init();
