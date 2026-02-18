import { detectJobDescription } from "./lib/detector";
import { scrapeJobDetails } from "./lib/scraper";

function main() {
  const pageText = document.body.innerText;
  const pageTitle = document.title;
  const url = window.location.href;

  const detection = detectJobDescription(pageText, pageTitle, url);

  if (detection.isJobDescription && detection.confidence >= 0.5) {
    const jobDetails = scrapeJobDetails(document, url);

    chrome.runtime.sendMessage({
      type: "JOB_DETECTED",
      data: {
        ...detection,
        jobTitle: jobDetails.jobTitle,
        companyName: jobDetails.companyName,
        jobDescriptionText: jobDetails.jobDescriptionText,
        url,
      },
    });
  }
}

// Listen for requests from popup to get current page data
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PAGE_DATA") {
    const jobDetails = scrapeJobDetails(document, window.location.href);
    sendResponse({
      pageText: document.body.innerText.substring(0, 15000),
      jobTitle: jobDetails.jobTitle,
      companyName: jobDetails.companyName,
      jobDescriptionText: jobDetails.jobDescriptionText,
      url: window.location.href,
    });
  }
  return true;
});

// Listen for auth tokens from the extension connect page
window.addEventListener("message", (event) => {
  if (event.data?.type === "JOBTAILOR_AUTH") {
    chrome.storage.local.set({
      accessToken: event.data.accessToken,
      refreshToken: event.data.refreshToken,
    });
  }
});

// Run detection after page has settled
if (document.readyState === "complete") {
  main();
} else {
  window.addEventListener("load", () => {
    setTimeout(main, 1000);
  });
}
