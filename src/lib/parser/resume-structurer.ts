import { extractSkillsFromStructuredSections } from "./structural-extractor";
import { extractFromVocabulary } from "../skills/skills-dictionary";
import { normalizeSkill } from "../skills/normalizer";
import {
  extractEmploymentTimeline,
  extractYearsOfExperience,
  EmploymentPeriod,
  AcademicPeriod,
} from "./timeline-extractor";
import { extractCandidateLinks, CandidateLinks } from "./link-extractor";

export type { EmploymentPeriod, AcademicPeriod, CandidateLinks };

export interface StructuredResume {
  skills: string[];
  yearsOfExperience?: number;
  email?: string;
  phone?: string;
  links?: CandidateLinks;
  rawText?: string;
  employmentTimeline?: EmploymentPeriod[];
  academicTimeline?: AcademicPeriod[];
  totalDurationFormatted?: string;
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
  const links = extractCandidateLinks(text);
  const timelineResult = extractEmploymentTimeline(text);
  const years = timelineResult.totalYears > 0 ? timelineResult.totalYears : timelineResult.explicitClaimYears;

  return {
    skills: merged,
    rawText: text,
    ...(years !== undefined && { yearsOfExperience: years }),
    ...(timelineResult.periods.length > 0 && { employmentTimeline: timelineResult.periods }),
    ...(timelineResult.academicPeriods && timelineResult.academicPeriods.length > 0 && {
      academicTimeline: timelineResult.academicPeriods,
    }),
    totalDurationFormatted: timelineResult.totalDurationFormatted,
    ...(email && { email }),
    ...(phone && { phone }),
    ...(Object.keys(links).length > 0 && { links }),
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

export { extractYearsOfExperience, extractEmploymentTimeline, extractCandidateLinks };
