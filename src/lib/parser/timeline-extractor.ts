// src/lib/parser/timeline-extractor.ts

export interface EmploymentPeriod {
  startDate: string;
  endDate: string;
  rawTimeline: string;
  isCurrent: boolean;
  durationMonths: number;
  durationFormatted: string; // e.g. "8 mos", "3 yrs 5 mos"
  roleTitle?: string;
  companyName?: string;
  headline: string;
  isInternship?: boolean;
  isContiguousWithNext?: boolean;
  isOverlappingWithNext?: boolean;
}

export interface AcademicPeriod {
  degreeName: string;
  rawTimeline: string;
}

export interface ExtractedTimeline {
  totalYears: number;
  totalMonths: number;
  totalDurationFormatted: string;
  periods: EmploymentPeriod[];
  academicPeriods?: AcademicPeriod[];
  explicitClaimYears?: number;
}

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec";
const PRESENT_TOKENS = "present|current|now|ongoing|till\\s*date|to\\s*date";
const SEPARATORS = "[-–—~]|to|until|through";

// Matches e.g. "October 2022 – May 2023", "06/2023 - Present", "2021 to 2024", "Oct 2022 - Current"
const DATE_RANGE_REGEX = new RegExp(
  `\\b((?:(?:${MONTH_NAMES})[.,\\s]+)?(?:20\\d\\d|19\\d\\d|\\d{1,2}[\\/.-](?:20\\d\\d|19\\d\\d|\\d\\d)))\\s*(?:${SEPARATORS})\\s*((?:(?:${MONTH_NAMES})[.,\\s]+)?(?:20\\d\\d|19\\d\\d|\\d{1,2}[\\/.-](?:20\\d\\d|19\\d\\d|\\d\\d)|${PRESENT_TOKENS}))\\b`,
  "gi"
);

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, "01": 1, "1": 1,
  feb: 2, february: 2, "02": 2, "2": 2,
  mar: 3, march: 3, "03": 3, "3": 3,
  apr: 4, april: 4, "04": 4, "4": 4,
  may: 5, "05": 5, "5": 5,
  jun: 6, june: 6, "06": 6, "6": 6,
  jul: 7, july: 7, "07": 7, "7": 7,
  aug: 8, august: 8, "08": 8, "8": 8,
  sep: 9, sept: 9, september: 9, "09": 9, "9": 9,
  oct: 10, october: 10, "10": 10,
  nov: 11, november: 11, "11": 11,
  dec: 12, december: 12, "12": 12,
};

interface DatePoint {
  year: number;
  month: number; // 1-12
  isCurrent: boolean;
  formatted: string;
}

function parseDatePoint(token: string, isEnd = false, evalDate: Date = new Date()): DatePoint | null {
  const clean = token.trim().toLowerCase();
  if (/^(present|current|now|ongoing|till\s*date|to\s*date)$/i.test(clean)) {
    return {
      year: evalDate.getFullYear(),
      month: evalDate.getMonth() + 1,
      isCurrent: true,
      formatted: "Present",
    };
  }

  // Month Name + Year: "October 2022", "Oct 2022", "Oct, 2022"
  const monthNameMatch = clean.match(/^([a-z]+)[.,\s]+(20\d\d|19\d\d|\d\d)$/i);
  if (monthNameMatch) {
    const mStr = monthNameMatch[1];
    let y = parseInt(monthNameMatch[2], 10);
    if (y < 100) y += y > 50 ? 1900 : 2000;
    const m = MONTHS[mStr.slice(0, 3)] || MONTHS[mStr];
    if (m && y >= 1980 && y <= evalDate.getFullYear() + 2) {
      return { year: y, month: m, isCurrent: false, formatted: `${monthNameMatch[1]} ${y}` };
    }
  }

  // MM/YYYY or MM-YYYY or MM/YY
  const slashMatch = clean.match(/^(\d{1,2})[\/\.-](\d{2,4})$/);
  if (slashMatch) {
    const m = parseInt(slashMatch[1], 10);
    let y = parseInt(slashMatch[2], 10);
    if (y < 100) y += y > 50 ? 1900 : 2000;
    if (m >= 1 && m <= 12 && y >= 1980 && y <= evalDate.getFullYear() + 2) {
      return { year: y, month: m, isCurrent: false, formatted: `${m}/${y}` };
    }
  }

  // YYYY alone: e.g. "2022"
  const yearOnlyMatch = clean.match(/^(20\d\d|19\d\d)$/);
  if (yearOnlyMatch) {
    const y = parseInt(yearOnlyMatch[1], 10);
    if (y >= 1980 && y <= evalDate.getFullYear() + 2) {
      return { year: y, month: isEnd ? 12 : 1, isCurrent: false, formatted: `${y}` };
    }
  }

  return null;
}

export function formatMonthsDuration(months: number): string {
  if (months <= 0) return "0 mos";
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  if (yrs === 0) return `${rem} mo${rem === 1 ? "" : "s"}`;
  if (rem === 0) return `${yrs} yr${yrs === 1 ? "" : "s"}`;
  return `${yrs} yr${yrs === 1 ? "" : "s"} ${rem} mo${rem === 1 ? "" : "s"}`;
}

function extractHeadline(
  line: string,
  prevLine: string | undefined,
  rawTimeline: string
): { roleTitle?: string; companyName?: string; headline: string } {
  let candidate = line.replace(rawTimeline, "").replace(/[()[\]{}–—~]/g, " ").trim();

  if (candidate.length < 3 && prevLine) {
    candidate = prevLine.replace(/^[•\-*–—\s]+/, "").trim();
  }

  candidate = candidate.replace(/^[,|:\s-]+|[,|:\s-]+$/g, "").trim();

  if (!candidate || candidate.length < 2) {
    return { headline: "Professional Role" };
  }

  const atMatch = candidate.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) {
    return {
      roleTitle: atMatch[1].trim(),
      companyName: atMatch[2].trim(),
      headline: `${atMatch[1].trim()} @ ${atMatch[2].trim()}`,
    };
  }

  const pipeMatch = candidate.match(/^(.+?)\s*\|\s*(.+)$/);
  if (pipeMatch) {
    return {
      roleTitle: pipeMatch[1].trim(),
      companyName: pipeMatch[2].trim(),
      headline: `${pipeMatch[1].trim()} · ${pipeMatch[2].trim()}`,
    };
  }

  const commaMatch = candidate.match(/^(.+?),\s*(.+)$/);
  if (commaMatch) {
    return {
      roleTitle: commaMatch[1].trim(),
      companyName: commaMatch[2].trim(),
      headline: `${commaMatch[1].trim()} @ ${commaMatch[2].trim()}`,
    };
  }

  return {
    roleTitle: candidate,
    headline: candidate,
  };
}

/**
 * Extracts and calculates career employment timelines and unique professional experience.
 *
 * Requirements satisfied:
 * - Extracts start and end dates from every employment entry.
 * - Extracts role title and company name context for each position.
 * - Treats Present / Current as the active evaluation date.
 * - Merges overlapping or contiguous periods (gap <= 1 month) to eliminate double counting.
 * - Distinguishes professional experience from academic degrees/education and internships.
 * - Preserves original employment periods as structured evidence.
 */
export function extractEmploymentTimeline(
  text: string,
  evalDate: Date = new Date()
): ExtractedTimeline {
  if (!text) {
    return { totalYears: 0, totalMonths: 0, totalDurationFormatted: "0 mos", periods: [] };
  }

  // 1. Explicit summary claims: e.g. "5+ years of experience", "Over 6 years of professional engineering experience"
  const explicitMatch = text.match(
    /(?:over|more than|\+)?\s*(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s*of)?(?:\s+[a-z-]+){0,3}\s*experience/i
  );
  let explicitClaimYears = explicitMatch ? parseInt(explicitMatch[1], 10) : undefined;
  if (explicitClaimYears && (explicitClaimYears <= 0 || explicitClaimYears > 40)) {
    explicitClaimYears = undefined;
  }

  // 2. Line-by-line section segmentation & date extraction
  const lines = text.split(/\r?\n/);
  let currentSection: "experience" | "education" | "projects" | "general" = "general";

  interface RawPeriod {
    startMonthIdx: number; // year * 12 + month
    endMonthIdx: number;
    startDateStr: string;
    endDateStr: string;
    rawTimeline: string;
    headline: string;
    roleTitle?: string;
    companyName?: string;
    isCurrent: boolean;
    isEducation: boolean;
    isInternship: boolean;
  }

  const rawPeriods: RawPeriod[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lower = line.toLowerCase();

    // Section header detection
    if (/^(?:work\s+)?experience|employment(?:\s+history)?|work\s+history|professional\s+experience/i.test(lower)) {
      currentSection = "experience";
      continue;
    } else if (/^(?:education|academic(?:\s+background)?|degrees?|university)/i.test(lower)) {
      currentSection = "education";
      continue;
    } else if (/^(?:projects?|personal\s+projects|certifications?|skills?|technologies)/i.test(lower)) {
      currentSection = "projects";
      continue;
    }

    // Contextual education indicators
    const isEducationLine =
      currentSection === "education" ||
      /\b(?:degree|bachelor|master|phd|b\.s|m\.s|b\.tech|m\.tech|b\.e|university|college|school|gpa|high\s*school)\b/i.test(
        lower
      );

    // Contextual internship indicators
    const isInternshipLine = /\b(?:intern|internship|fellow|fellowship|trainee)\b/i.test(lower);

    // Match all date ranges in this line
    DATE_RANGE_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = DATE_RANGE_REGEX.exec(line)) !== null) {
      const startStr = match[1];
      const endStr = match[2];

      const start = parseDatePoint(startStr, false, evalDate);
      const end = parseDatePoint(endStr, true, evalDate);

      if (start && end) {
        const startMonthIdx = start.year * 12 + start.month;
        const endMonthIdx = end.year * 12 + end.month;

        if (endMonthIdx >= startMonthIdx && endMonthIdx - startMonthIdx <= 40 * 12) {
          const headlineInfo = extractHeadline(line, i > 0 ? lines[i - 1] : undefined, match[0]);

          rawPeriods.push({
            startMonthIdx,
            endMonthIdx,
            startDateStr: start.formatted,
            endDateStr: end.formatted,
            rawTimeline: match[0],
            headline: headlineInfo.headline,
            roleTitle: headlineInfo.roleTitle,
            companyName: headlineInfo.companyName,
            isCurrent: end.isCurrent,
            isEducation: isEducationLine,
            isInternship: isInternshipLine,
          });
        }
      }
    }
  }

  // 3. Separate professional experience from education
  const professionalPeriods = rawPeriods.filter((p) => !p.isEducation);
  const academicPeriods: AcademicPeriod[] = rawPeriods
    .filter((p) => p.isEducation)
    .map((p) => ({
      degreeName: p.headline !== "Professional Role" ? p.headline : "Academic Degree",
      rawTimeline: p.rawTimeline,
    }));

  // If only education was present, do not invent professional experience
  if (professionalPeriods.length === 0) {
    const explicitMonths = explicitClaimYears ? explicitClaimYears * 12 : 0;
    return {
      totalYears: explicitClaimYears ?? 0,
      totalMonths: explicitMonths,
      totalDurationFormatted: formatMonthsDuration(explicitMonths),
      periods: [],
      academicPeriods: academicPeriods.length > 0 ? academicPeriods : undefined,
      ...(explicitClaimYears !== undefined && { explicitClaimYears }),
    };
  }

  // 4. Sort intervals chronologically by start date
  professionalPeriods.sort((a, b) => a.startMonthIdx - b.startMonthIdx || a.endMonthIdx - b.endMonthIdx);

  // 5. Merge overlapping or contiguous employment periods (gap <= 1 month)
  interface MergedRange {
    startMonthIdx: number;
    endMonthIdx: number;
    months: number;
  }
  const mergedRanges: MergedRange[] = [];

  for (const period of professionalPeriods) {
    if (mergedRanges.length === 0) {
      mergedRanges.push({
        startMonthIdx: period.startMonthIdx,
        endMonthIdx: period.endMonthIdx,
        months: period.endMonthIdx - period.startMonthIdx + 1,
      });
    } else {
      const prev = mergedRanges[mergedRanges.length - 1];
      if (period.startMonthIdx <= prev.endMonthIdx + 1) {
        prev.endMonthIdx = Math.max(prev.endMonthIdx, period.endMonthIdx);
        prev.months = prev.endMonthIdx - prev.startMonthIdx + 1;
      } else {
        mergedRanges.push({
          startMonthIdx: period.startMonthIdx,
          endMonthIdx: period.endMonthIdx,
          months: period.endMonthIdx - period.startMonthIdx + 1,
        });
      }
    }
  }

  const totalUniqueMonths = mergedRanges.reduce((sum, r) => sum + r.months, 0);
  const timelineYears = Math.min(40, Math.round((totalUniqueMonths / 12) * 10) / 10);

  // Convert raw periods into structured evidence periods with contiguous/overlapping flags
  const structuredPeriods: EmploymentPeriod[] = professionalPeriods.map((p, idx) => {
    let isContiguousWithNext = false;
    let isOverlappingWithNext = false;

    if (idx < professionalPeriods.length - 1) {
      const next = professionalPeriods[idx + 1];
      if (next.startMonthIdx <= p.endMonthIdx + 1 && next.startMonthIdx > p.endMonthIdx) {
        isContiguousWithNext = true;
      } else if (next.startMonthIdx <= p.endMonthIdx) {
        isOverlappingWithNext = true;
      }
    }

    const durationMonths = p.endMonthIdx - p.startMonthIdx + 1;

    return {
      startDate: p.startDateStr,
      endDate: p.endDateStr,
      rawTimeline: p.rawTimeline,
      isCurrent: p.isCurrent,
      durationMonths,
      durationFormatted: formatMonthsDuration(durationMonths),
      roleTitle: p.roleTitle,
      companyName: p.companyName,
      headline: p.headline,
      ...(p.isInternship && { isInternship: true }),
      ...(isContiguousWithNext && { isContiguousWithNext: true }),
      ...(isOverlappingWithNext && { isOverlappingWithNext: true }),
    };
  });

  const finalYears =
    explicitClaimYears !== undefined
      ? Math.min(40, Math.max(explicitClaimYears, Math.round(timelineYears)))
      : Math.min(40, Math.round(timelineYears));

  return {
    totalYears: finalYears,
    totalMonths: totalUniqueMonths,
    totalDurationFormatted: formatMonthsDuration(totalUniqueMonths),
    periods: structuredPeriods,
    academicPeriods: academicPeriods.length > 0 ? academicPeriods : undefined,
    ...(explicitClaimYears !== undefined && { explicitClaimYears }),
  };
}

/**
 * Backward-compatible helper that returns the numeric years of experience.
 */
export function extractYearsOfExperience(text: string): number | undefined {
  if (!text) return undefined;
  const result = extractEmploymentTimeline(text);
  return result.totalYears > 0 ? result.totalYears : result.explicitClaimYears;
}
