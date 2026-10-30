// src/lib/parser/resume-structurer.ts

import { extractSkillsFromStructuredSections } from "./structural-extractor";
import { extractFromVocabulary } from "../skills/skills-dictionary";
import { normalizeSkill } from "../skills/normalizer";

export interface StructuredResume {
  skills: string[];
  yearsOfExperience?: number;
  email?: string;
  phone?: string;
}

export function structureResume(text: string): StructuredResume {
  // 1. Dynamic extraction from Skills section (catches unlisted & custom skills)
  const sectionSkills = extractSkillsFromStructuredSections(text);

  // 2. Vocabulary extraction from full text (catches skills in experience/projects)
  const vocabSkills = extractFromVocabulary(text);

  // 3. Merge and deduplicate by canonical normalized form
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const skill of [...sectionSkills, ...vocabSkills]) {
    const norm = normalizeSkill(skill);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      merged.push(skill);
    }
  }

  merged.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const email = extractEmail(text);
  const phone = extractPhone(text);
  const years = extractYearsOfExperience(text);

  return {
    skills: merged,
    ...(years !== undefined && { yearsOfExperience: years }),
    ...(email && { email }),
    ...(phone && { phone }),
  };
}

function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : undefined;
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : undefined;
}

/**
 * Estimates total years of experience from explicit summary claims or date range intervals
 */
export function extractYearsOfExperience(text: string): number | undefined {
  if (!text) return undefined;

  const currentYear = new Date().getFullYear();

  // 1. Explicit summary claims: e.g. "5+ years of experience", "Over 8 years of hands-on experience"
  const explicitMatch = text.match(
    /(?:over|more than|\+)?\s*(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:professional|software|engineering|hands-on|industry|work|full-time)?\s*experience/i
  );
  let explicitYears = explicitMatch ? parseInt(explicitMatch[1], 10) : undefined;
  if (explicitYears && (explicitYears <= 0 || explicitYears > 40)) {
    explicitYears = undefined;
  }

  // 2. Timeline extraction from date intervals (e.g. 2019 - 2024, 2021 - Present, Jan 2018 to Dec 2022)
  const dateRangeRegex = /\b(20\d\d|19\d\d)\s*(?:[-–—]|to)\s*(20\d\d|19\d\d|present|current|now)\b/gi;
  const intervals: [number, number][] = [];
  let match: RegExpExecArray | null;

  while ((match = dateRangeRegex.exec(text)) !== null) {
    const start = parseInt(match[1], 10);
    const endStr = match[2].toLowerCase();
    const end = /present|current|now/.test(endStr) ? currentYear : parseInt(endStr, 10);

    if (start >= 1980 && end >= start && end <= currentYear + 1 && (end - start) <= 40) {
      intervals.push([start, end]);
    }
  }

  // Merge overlapping or adjacent intervals
  if (intervals.length > 0) {
    intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged: [number, number][] = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
      const prev = merged[merged.length - 1];
      const curr = intervals[i];

      if (curr[0] <= prev[1]) {
        prev[1] = Math.max(prev[1], curr[1]);
      } else {
        merged.push(curr);
      }
    }

    const timelineYears = merged.reduce((total, [s, e]) => total + Math.max(1, e - s), 0);
    
    // If both explicit and timeline exist, take the reasonable maximum
    if (explicitYears !== undefined) {
      return Math.min(40, Math.max(explicitYears, timelineYears));
    }
    return Math.min(40, timelineYears);
  }

  return explicitYears;
}