// src/lib/parser/structural-extractor.ts

const SKILL_SECTION_HEADERS = [
  "technical skills",
  "core competencies",
  "skills & technologies",
  "technical expertise",
  "skills & tools",
  "skills",
  "technologies",
  "tools & technologies",
  "stack",
  "proficiencies",
  "technical requirements",
  "required skills",
  "requirements",
  "qualifications",
  "must have",
  "nice to have",
  "preferred skills",
  "preferred",
  "bonus",
];

const STOP_HEADERS = [
  "experience",
  "work experience",
  "professional experience",
  "employment history",
  "work history",
  "education",
  "academic background",
  "projects",
  "personal projects",
  "key projects",
  "certifications",
  "awards",
  "honors",
  "publications",
  "languages",
  "references",
  "responsibilities",
  "key responsibilities",
  "duties",
  "role overview",
  "day-to-day",
  "what you'll do",
  "what you will do",
  "about us",
  "about the company",
  "about the role",
  "about",
  "who we are",
  "benefits",
  "perks",
  "compensation",
  "what we offer",
  "why join us",
  "salary",
  "how to apply",
  "equal opportunity",
  "eeo",
];

const METADATA_PREFIXES = [
  "company:",
  "location:",
  "experience:",
  "job title:",
  "position:",
  "salary:",
  "compensation:",
  "about us:",
  "about the company:",
  "about the role:",
  "about:",
  "reports to:",
  "employment type:",
  "work location:",
  "posted:",
];

const NOISE_WORDS = new Set([
  "proficient", "experienced", "experience", "knowledge", "strong", "understanding",
  "familiar", "skills", "tools", "languages", "frameworks", "libraries",
  "databases", "platforms", "etc", "years", "year", "and", "or", "with",
  "using", "including", "across", "working", "good", "hybrid", "remote",
  "onsite", "full-time", "part-time", "austin", "dallas", "tx", "texas",
  "technologies", "solutions", "inc", "llc", "corp", "company"
]);

/**
 * Dynamically parses skills from structured "Skills" or "Requirements" blocks using delimiters.
 */
export function extractSkillsFromStructuredSections(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  let inSkillsSection = false;
  const rawSkillLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const lower = line.toLowerCase();

    // 0. Skip metadata lines (Company: XYZ, Location: ABC, Experience: 3-5 years)
    const isMetadataLine = METADATA_PREFIXES.some(prefix => lower.startsWith(prefix));
    if (isMetadataLine) {
      if (inSkillsSection) {
        break; // If we were in a skills section and hit metadata, stop
      }
      continue;
    }

    // 1. Detect start of Skills section
    // Must look like an intentional header, not a sentence containing a keyword
    const isStartHeader = SKILL_SECTION_HEADERS.some(h => {
      if (lower === h || lower.startsWith(`${h}:`) || lower === `${h} :`) return true;
      if (new RegExp(`^([•*\\-]\\s*)?${h}\\s*[:]?$`, "i").test(line)) return true;
      
      // If it contains the header phrase, ensure it is short and lacks full-sentence action verbs
      if (lower.includes(h) && line.length < 35) {
        const hasSentenceVerbs = /\b(seeking|looking|collaborate|translate|design|build|manage|deliver|deploy|work with)\b/i.test(line);
        return !hasSentenceVerbs;
      }
      return false;
    });

    if (isStartHeader) {
      inSkillsSection = true;
      if (line.includes(":")) {
        const afterColon = line.split(/:(.+)/)[1]?.trim();
        if (afterColon) rawSkillLines.push(afterColon);
      }
      continue;
    }

    // 2. Detect end of Skills section
    if (inSkillsSection) {
      const isStopHeader = STOP_HEADERS.some(h => {
        if (lower === h || lower.startsWith(`${h}:`) || lower === `${h} :`) return true;
        if (new RegExp(`^([•*\\-]\\s*)?${h}\\s*[:]?$`, "i").test(line)) return true;
        return lower.includes(h) && line.length < 30 && !/\b(with|in|and|tools|development)\b/i.test(line);
      });

      if (isStopHeader) {
        break;
      }

      rawSkillLines.push(line);
    }
  }

  // 3. Tokenize lines by delimiters (commas, pipes, bullets, semicolons)
  const extracted: string[] = [];

  for (const line of rawSkillLines) {
    // Strip subheaders like "Frontend:", "• Languages:", "Tools:"
    const content = line.replace(/^[•·▪◦‣➢➤►\-*\s]*[A-Za-z\s&/]+:\s*/, "");
    const tokens = content.split(/[,|•·;▪◦‣\n]/);

    for (let token of tokens) {
      token = token.replace(/^[–\-*•·▪◦‣➢➤►()]\s*/, "").replace(/[()]/g, "").trim();

      // Strip leading noise phrases like "Experience with", "hands-on with", "and", "or"
      token = token.replace(/^(?:experience\s+(?:with|in)|hands-on\s+(?:with|in)|knowledge\s+of|proficient\s+in|familiarity\s+with|familiar\s+with|strong\s+knowledge\s+of|and|or)\s+/i, "").trim();
      // Strip trailing noise words like "pipelines", "practices", "development"
      token = token.replace(/\s+(?:pipelines|practices|development|technologies)$/i, "").trim();

      if (
        token.length >= 2 &&
        token.length <= 30 &&
        !/^\d+$/.test(token) &&
        !NOISE_WORDS.has(token.toLowerCase())
      ) {
        extracted.push(token);
      }
    }
  }

  return Array.from(new Set(extracted));
}
