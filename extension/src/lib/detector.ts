export interface DetectionResult {
  isJobDescription: boolean;
  confidence: number;
  signals: string[];
}

const JOB_KEYWORDS = [
  "responsibilities",
  "qualifications",
  "requirements",
  "apply now",
  "apply for this",
  "submit application",
  "years of experience",
  "years experience",
  "full-time",
  "part-time",
  "contract",
  "remote",
  "salary range",
  "compensation",
  "equal opportunity employer",
  "about the role",
  "about this role",
  "what you'll do",
  "what we're looking for",
  "nice to have",
  "must have",
  "preferred qualifications",
  "benefits",
  "perks",
  "job description",
  "position overview",
  "key responsibilities",
  "minimum qualifications",
  "desired skills",
];

const JOB_BOARD_DOMAINS = [
  "linkedin.com/jobs",
  "indeed.com",
  "glassdoor.com",
  "greenhouse.io",
  "lever.co",
  "workday.com",
  "myworkdayjobs.com",
  "jobs.ashbyhq.com",
  "boards.greenhouse.io",
  "wellfound.com",
  "ziprecruiter.com",
  "monster.com",
  "dice.com",
  "hired.com",
  "angel.co/jobs",
  "simplyhired.com",
  "careerbuilder.com",
  "smartrecruiters.com",
  "jobvite.com",
  "icims.com",
  "bamboohr.com",
];

export function detectJobDescription(
  pageText: string,
  pageTitle: string,
  url: string
): DetectionResult {
  const signals: string[] = [];
  let score = 0;
  const textLower = pageText.toLowerCase();
  const urlLower = url.toLowerCase();

  // Signal 1: Known job board domain
  if (JOB_BOARD_DOMAINS.some((domain) => urlLower.includes(domain))) {
    score += 0.4;
    signals.push("known_job_board");
  }

  // Signal 2: URL contains job-related paths
  if (
    /\/(jobs?|careers?|positions?|openings?|apply|posting)\b/i.test(urlLower)
  ) {
    score += 0.2;
    signals.push("job_url_pattern");
  }

  // Signal 3: Keyword density
  const keywordHits = JOB_KEYWORDS.filter((kw) => textLower.includes(kw));
  const keywordScore = Math.min(keywordHits.length / 5, 0.4);
  if (keywordScore > 0) {
    score += keywordScore;
    signals.push(`keywords:${keywordHits.length}`);
  }

  // Signal 4: Page title patterns
  if (/\b(job|career|position|hiring|opening|apply)\b/i.test(pageTitle)) {
    score += 0.1;
    signals.push("title_pattern");
  }

  // Signal 5: Schema.org JobPosting in page source
  if (textLower.includes("jobposting")) {
    score += 0.3;
    signals.push("schema_org");
  }

  return {
    isJobDescription: score >= 0.5,
    confidence: Math.min(score, 1.0),
    signals,
  };
}
