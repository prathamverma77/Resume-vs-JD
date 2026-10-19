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

const NOISE_WORDS = new Set([
  "proficient", "experienced", "experience", "knowledge", "strong", "understanding",
  "familiar", "skills", "tools", "languages", "frameworks", "libraries",
  "databases", "platforms", "etc", "years", "year", "and", "or", "with",
  "using", "including", "across", "working", "good"
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

    // 1. Detect start of Skills section
    const isStartHeader = SKILL_SECTION_HEADERS.some(h => 
      lower === h || lower.startsWith(`${h}:`) || lower === `${h} :` || (lower.includes(h) && line.length < 35)
    );

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
      const isStopHeader = STOP_HEADERS.some(h => 
        lower === h || lower.startsWith(`${h}:`) || lower === `${h} :` || (lower.includes(h) && line.length < 35)
      );

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
