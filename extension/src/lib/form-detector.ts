export interface DetectedField {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  fieldType: string; // name, email, phone, linkedin, etc.
  confidence: number;
  label?: string;
}

export interface FormDetectionResult {
  isApplicationForm: boolean;
  confidence: number;
  fields: DetectedField[];
}

// Common label/attribute patterns for application form fields
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  first_name: [
    /first[\s_-]?name/i,
    /given[\s_-]?name/i,
    /fname/i,
    /\bfirst\b/i,
  ],
  last_name: [
    /last[\s_-]?name/i,
    /family[\s_-]?name/i,
    /surname/i,
    /lname/i,
    /\blast\b/i,
  ],
  full_name: [
    /full[\s_-]?name/i,
    /your[\s_-]?name/i,
    /candidate[\s_-]?name/i,
    /^name$/i,
  ],
  email: [
    /e[\s_-]?mail/i,
    /email[\s_-]?address/i,
  ],
  phone: [
    /phone/i,
    /mobile/i,
    /telephone/i,
    /cell/i,
    /contact[\s_-]?number/i,
  ],
  linkedin: [
    /linkedin/i,
    /linked[\s_-]?in/i,
  ],
  github: [
    /github/i,
    /git[\s_-]?hub/i,
  ],
  portfolio: [
    /portfolio/i,
    /personal[\s_-]?website/i,
    /website[\s_-]?url/i,
    /^website$/i,
  ],
  location: [
    /location/i,
    /city/i,
    /address/i,
    /where[\s_-]?are[\s_-]?you/i,
  ],
  salary: [
    /salary/i,
    /compensation/i,
    /pay[\s_-]?expectation/i,
    /desired[\s_-]?pay/i,
  ],
  work_authorization: [
    /work[\s_-]?auth/i,
    /authorized[\s_-]?to[\s_-]?work/i,
    /legally[\s_-]?authorized/i,
    /work[\s_-]?eligib/i,
    /right[\s_-]?to[\s_-]?work/i,
  ],
  visa_sponsorship: [
    /visa[\s_-]?sponsor/i,
    /sponsorship/i,
    /require[\s_-]?sponsor/i,
    /need[\s_-]?sponsor/i,
  ],
  relocate: [
    /relocat/i,
    /willing[\s_-]?to[\s_-]?move/i,
  ],
  years_experience: [
    /years[\s_-]?(of[\s_-]?)?experience/i,
    /experience[\s_-]?years/i,
    /how[\s_-]?many[\s_-]?years/i,
  ],
  education: [
    /education/i,
    /degree/i,
    /highest[\s_-]?level/i,
    /school/i,
    /university/i,
  ],
  current_title: [
    /current[\s_-]?title/i,
    /job[\s_-]?title/i,
    /current[\s_-]?role/i,
    /current[\s_-]?position/i,
  ],
  resume_upload: [
    /resume/i,
    /cv[\s_-]?upload/i,
    /attach[\s_-]?(your[\s_-]?)?resume/i,
    /upload[\s_-]?(your[\s_-]?)?resume/i,
  ],
  cover_letter: [
    /cover[\s_-]?letter/i,
  ],
};

// Keywords that indicate this is a job application form
const APPLICATION_KEYWORDS = [
  "apply",
  "application",
  "submit your",
  "candidate",
  "applicant",
  "resume",
  "cover letter",
  "work authorization",
  "linkedin",
  "years of experience",
];

function getFieldIdentifiers(el: HTMLElement): string[] {
  const identifiers: string[] = [];

  // Check element attributes
  const attrs = ["name", "id", "placeholder", "aria-label", "data-testid", "autocomplete"];
  for (const attr of attrs) {
    const val = el.getAttribute(attr);
    if (val) identifiers.push(val);
  }

  // Check associated label
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label?.textContent) identifiers.push(label.textContent.trim());
  }

  // Check parent label
  const parentLabel = el.closest("label");
  if (parentLabel?.textContent) {
    identifiers.push(parentLabel.textContent.trim());
  }

  // Check preceding sibling or parent label text
  const prevSibling = el.previousElementSibling;
  if (prevSibling?.tagName === "LABEL") {
    identifiers.push(prevSibling.textContent?.trim() || "");
  }

  return identifiers.filter(Boolean);
}

function classifyField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): DetectedField | null {
  // Skip hidden, submit, button, and file inputs (except resume)
  if (el instanceof HTMLInputElement) {
    if (["hidden", "submit", "button", "image", "reset"].includes(el.type)) return null;
  }

  const identifiers = getFieldIdentifiers(el);
  if (identifiers.length === 0) return null;

  const identifierStr = identifiers.join(" ");

  for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(identifierStr)) {
        return {
          element: el,
          fieldType,
          confidence: 0.8,
          label: identifiers[0],
        };
      }
    }
  }

  // Check for email by input type
  if (el instanceof HTMLInputElement && el.type === "email") {
    return { element: el, fieldType: "email", confidence: 0.9, label: "Email" };
  }

  // Check for phone by input type
  if (el instanceof HTMLInputElement && el.type === "tel") {
    return { element: el, fieldType: "phone", confidence: 0.9, label: "Phone" };
  }

  // Check for URL by input type
  if (el instanceof HTMLInputElement && el.type === "url") {
    // Try to determine if it's LinkedIn, GitHub, or portfolio
    for (const pattern of FIELD_PATTERNS.linkedin) {
      if (pattern.test(identifierStr)) return { element: el, fieldType: "linkedin", confidence: 0.7, label: identifiers[0] };
    }
    for (const pattern of FIELD_PATTERNS.github) {
      if (pattern.test(identifierStr)) return { element: el, fieldType: "github", confidence: 0.7, label: identifiers[0] };
    }
    return { element: el, fieldType: "portfolio", confidence: 0.5, label: identifiers[0] };
  }

  // File input for resume
  if (el instanceof HTMLInputElement && el.type === "file") {
    for (const pattern of FIELD_PATTERNS.resume_upload) {
      if (pattern.test(identifierStr)) {
        return { element: el, fieldType: "resume_upload", confidence: 0.9, label: identifiers[0] };
      }
    }
  }

  return null;
}

export function detectApplicationForm(): FormDetectionResult {
  const forms = document.querySelectorAll("form");
  const allFields: DetectedField[] = [];

  // Also scan inputs outside of forms (some sites use divs)
  const allInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input, select, textarea"
  );

  for (const input of allInputs) {
    const field = classifyField(input);
    if (field) allFields.push(field);
  }

  // Calculate application form confidence
  const pageText = document.body.innerText.toLowerCase();
  let score = 0;

  // Check for application keywords
  const keywordHits = APPLICATION_KEYWORDS.filter((kw) => pageText.includes(kw));
  score += Math.min(keywordHits.length / 4, 0.4);

  // Check field types found — more diverse fields = higher confidence
  const uniqueFieldTypes = new Set(allFields.map((f) => f.fieldType));
  if (uniqueFieldTypes.has("email")) score += 0.15;
  if (uniqueFieldTypes.has("full_name") || uniqueFieldTypes.has("first_name")) score += 0.15;
  if (uniqueFieldTypes.has("resume_upload")) score += 0.2;
  if (uniqueFieldTypes.has("linkedin")) score += 0.1;
  if (uniqueFieldTypes.has("phone")) score += 0.1;
  if (uniqueFieldTypes.size >= 4) score += 0.1;

  // Check for form existence
  if (forms.length > 0) score += 0.1;

  // Known application platforms in URL
  const url = window.location.href.toLowerCase();
  if (/greenhouse\.io|lever\.co|workday\.com|smartrecruiters|icims|bamboohr|ashbyhq|jobvite/.test(url)) {
    score += 0.3;
  }
  if (/\/apply|\/application|\/submit/i.test(url)) {
    score += 0.2;
  }

  return {
    isApplicationForm: score >= 0.5 && allFields.length >= 2,
    confidence: Math.min(score, 1.0),
    fields: allFields,
  };
}
