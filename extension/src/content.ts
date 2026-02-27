import { detectJobDescription } from "./lib/detector";
import { scrapeJobDetails } from "./lib/scraper";
import { detectApplicationForm } from "./lib/form-detector";
import { fillFormFields } from "./lib/form-filler";
import type { ProfileData } from "./lib/form-filler";

let cachedFormFields: ReturnType<typeof detectApplicationForm>["fields"] = [];

function main() {
  const pageText = document.body.innerText;
  const pageTitle = document.title;
  const url = window.location.href;

  // Job description detection
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

  // Application form detection
  const formDetection = detectApplicationForm();
  if (formDetection.isApplicationForm) {
    cachedFormFields = formDetection.fields;
    chrome.runtime.sendMessage({
      type: "APPLICATION_DETECTED",
      data: {
        isApplicationForm: true,
        confidence: formDetection.confidence,
        fieldCount: formDetection.fields.length,
        fieldTypes: formDetection.fields.map((f) => f.fieldType),
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

  if (message.type === "GET_FORM_FIELDS") {
    // Re-detect to get fresh fields
    const formDetection = detectApplicationForm();
    cachedFormFields = formDetection.fields;
    sendResponse({
      isApplicationForm: formDetection.isApplicationForm,
      fieldCount: formDetection.fields.length,
      fieldTypes: formDetection.fields.map((f) => f.fieldType),
    });
  }

  if (message.type === "FILL_FORM") {
    const profile = message.profile as ProfileData;
    // Re-detect to make sure we have current DOM references
    const formDetection = detectApplicationForm();
    const result = fillFormFields(formDetection.fields, profile);
    sendResponse(result);
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
