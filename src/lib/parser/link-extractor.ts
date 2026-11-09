export interface CandidateLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
  twitter?: string;
  blog?: string;
}

const RESERVED_GITHUB_HANDLES = new Set([
  "features",
  "pricing",
  "about",
  "blog",
  "explore",
  "enterprise",
  "topics",
  "trending",
  "collections",
  "settings",
  "notifications",
]);

const RESERVED_TWITTER_HANDLES = new Set([
  "home",
  "explore",
  "notifications",
  "messages",
  "i",
  "intent",
  "search",
  "settings",
]);

const EXCLUDED_PORTFOLIO_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "github.com",
  "linkedin.com",
  "leetcode.com",
  "twitter.com",
  "x.com",
  "medium.com",
  "google.com",
  "facebook.com",
  "instagram.com",
]);

/**
 * Normalizes a raw URL into an absolute HTTPS URL.
 */
function ensureHttps(url: string): string {
  const trimmed = url.trim().replace(/[),;.]+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Precision extraction of developer social & portfolio links from resume text.
 * Focuses on candidate header contact areas and standard platform URL structures.
 */
export function extractCandidateLinks(text: string): CandidateLinks {
  const links: CandidateLinks = {};
  if (!text || text.trim().length === 0) return links;

  // Header zone: Most candidate links reside in the first 2,000 characters
  const headerText = text.slice(0, 2500);

  // 1. GitHub
  const githubMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)(?:\/[a-zA-Z0-9_.-]+)*\/?/i
  );
  if (githubMatch && githubMatch[1]) {
    const handle = githubMatch[1].trim();
    if (!RESERVED_GITHUB_HANDLES.has(handle.toLowerCase())) {
      links.github = ensureHttps(`github.com/${handle}`);
    }
  }

  // 2. LinkedIn
  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub|profile)\/([a-zA-Z0-9_\-–%]+)\/?/i
  );
  if (linkedinMatch && linkedinMatch[1]) {
    const id = linkedinMatch[1].trim();
    links.linkedin = ensureHttps(`linkedin.com/in/${id}`);
  }

  // 3. LeetCode
  const leetcodeMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_\-]+)\/?/i
  );
  if (leetcodeMatch && leetcodeMatch[1]) {
    const handle = leetcodeMatch[1].trim();
    links.leetcode = ensureHttps(`leetcode.com/u/${handle}`);
  }

  // 4. Twitter / X
  const twitterMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,25})\/?/i
  );
  if (twitterMatch && twitterMatch[1]) {
    const handle = twitterMatch[1].trim();
    if (!RESERVED_TWITTER_HANDLES.has(handle.toLowerCase())) {
      links.twitter = ensureHttps(`x.com/${handle}`);
    }
  }

  // 5. Explicit Portfolio / Website label (e.g., "Portfolio: https://john.dev", "Website: myapp.io")
  const explicitSiteMatch = headerText.match(
    /(?:portfolio|personal website|website|web|site)\s*[:|–-]\s*(https?:\/\/[^\s,;]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s,;]*)?)/i
  );

  if (explicitSiteMatch && explicitSiteMatch[1]) {
    const candidateUrl = explicitSiteMatch[1].trim().replace(/[),;.]+$/, "");
    const domain = candidateUrl.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
    if (!EXCLUDED_PORTFOLIO_DOMAINS.has(domain) && !domain.includes("@")) {
      links.portfolio = ensureHttps(candidateUrl);
    }
  }

  // 6. Developer TLDs in header (e.g., "pratham.dev", "alex.me", "studio.design", "project.page")
  if (!links.portfolio) {
    const devTldMatch = headerText.match(
      /(?<![a-zA-Z0-9@._%+-])(?:https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]*\.(?:dev|me|io|design|app|site|tech|fyi))(?:\/[^\s,;]*)?/i
    );
    if (devTldMatch && devTldMatch[0]) {
      const candidateUrl = devTldMatch[0].trim().replace(/[),;.]+$/, "");
      const domain = candidateUrl.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
      if (!EXCLUDED_PORTFOLIO_DOMAINS.has(domain)) {
        links.portfolio = ensureHttps(candidateUrl);
      }
    }
  }

  return links;
}

