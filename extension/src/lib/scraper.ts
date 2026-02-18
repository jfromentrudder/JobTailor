export interface ScrapedJob {
  jobTitle?: string;
  companyName?: string;
  jobDescriptionText: string;
}

export function scrapeJobDetails(doc: Document, url: string): ScrapedJob {
  // Try structured data first (JSON-LD)
  const jsonLd = extractJsonLd(doc);
  if (jsonLd) return jsonLd;

  // Try platform-specific selectors
  const platformResult = scrapePlatformSpecific(doc, url);
  if (platformResult) return platformResult;

  // Fallback: generic extraction
  return scrapeGeneric(doc);
}

function extractJsonLd(doc: Document): ScrapedJob | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "");
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "JobPosting") {
          return {
            jobTitle: item.title,
            companyName: item.hiringOrganization?.name,
            jobDescriptionText: stripHtml(item.description || ""),
          };
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }
  return null;
}

function scrapePlatformSpecific(
  doc: Document,
  url: string
): ScrapedJob | null {
  const urlLower = url.toLowerCase();

  // LinkedIn
  if (urlLower.includes("linkedin.com")) {
    const title =
      getText(doc, ".top-card-layout__title") ||
      getText(doc, ".job-details-jobs-unified-top-card__job-title") ||
      getText(doc, "h1");
    const company =
      getText(doc, ".topcard__org-name-link") ||
      getText(doc, ".job-details-jobs-unified-top-card__company-name");
    const description =
      getText(doc, ".description__text") ||
      getText(doc, ".jobs-description__content") ||
      getText(doc, ".jobs-description");
    if (description) {
      return { jobTitle: title, companyName: company, jobDescriptionText: description };
    }
  }

  // Indeed
  if (urlLower.includes("indeed.com")) {
    const title = getText(doc, ".jobsearch-JobInfoHeader-title") || getText(doc, "h1");
    const company = getText(doc, "[data-company-name]") || getText(doc, ".jobsearch-InlineCompanyRating-companyHeader");
    const description = getText(doc, "#jobDescriptionText") || getText(doc, ".jobsearch-jobDescriptionText");
    if (description) {
      return { jobTitle: title, companyName: company, jobDescriptionText: description };
    }
  }

  // Greenhouse
  if (urlLower.includes("greenhouse.io") || urlLower.includes("boards.greenhouse")) {
    const title = getText(doc, ".app-title") || getText(doc, "h1");
    const company = getText(doc, ".company-name");
    const description = getText(doc, "#content") || getText(doc, ".content");
    if (description) {
      return { jobTitle: title, companyName: company, jobDescriptionText: description };
    }
  }

  // Lever
  if (urlLower.includes("lever.co")) {
    const title = getText(doc, ".posting-headline h2") || getText(doc, "h1");
    const company = getText(doc, ".posting-headline .company");
    const description = getText(doc, ".posting-page") || getText(doc, "[data-qa='job-description']");
    if (description) {
      return { jobTitle: title, companyName: company, jobDescriptionText: description };
    }
  }

  // Workday
  if (urlLower.includes("workday.com") || urlLower.includes("myworkdayjobs.com")) {
    const title = getText(doc, "[data-automation-id='jobPostingHeader']") || getText(doc, "h1");
    const description = getText(doc, "[data-automation-id='jobPostingDescription']") || getText(doc, ".job-description");
    if (description) {
      return { jobTitle: title, jobDescriptionText: description };
    }
  }

  return null;
}

function scrapeGeneric(doc: Document): ScrapedJob {
  const h1 = getText(doc, "h1");
  const main = doc.querySelector(
    'main, [role="main"], article, .job-description, #job-description, .posting-page'
  );
  const text = (main || doc.body).innerText;

  return {
    jobTitle: h1 || undefined,
    companyName: undefined,
    jobDescriptionText: text.substring(0, 10000),
  };
}

function getText(doc: Document, selector: string): string | undefined {
  const el = doc.querySelector(selector);
  const text = el?.textContent?.trim();
  return text || undefined;
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}
