// lib/jd-parser.ts
import { extractFromVocabulary } from "../skills/skills-dictionary";
import { extractSkillsFromStructuredSections } from "./structural-extractor";
import { normalizeSkill } from "../skills/normalizer";

export interface JDExtractedData {
    role: string;
    responsibilities: string[];
    technical_req: string[];
    preferred_skills: string[];
    education: string[];
    minYearsExperience?: number;
}

/**
 * Main function to parse job description text
 */
export function parseJD(text: string): JDExtractedData {
    // Clean the text
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Extract preferred skills first to avoid duplicate assignment in technical requirements
    const preferred = extractPreferredSkills(cleanText);
    const preferredSet = new Set(preferred.map(s => normalizeSkill(s)));

    const rawTechnical = extractTechnicalRequirements(cleanText);
    const technical = rawTechnical.filter(s => !preferredSet.has(normalizeSkill(s)));
    const minYearsExperience = extractMinYearsExperience(cleanText);

    return {
        role: extractRole(cleanText),
        responsibilities: extractResponsibilities(cleanText),
        technical_req: technical.length > 0 ? technical : rawTechnical,
        preferred_skills: preferred,
        education: extractEducation(cleanText),
        ...(minYearsExperience !== undefined && { minYearsExperience })
    };
}

// ============================================
// 1. EXTRACT ROLE (JOB TITLE)
// ============================================
function extractRole(text: string): string {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check first 10 lines for role indicators
    for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Look for role indicators
        if (lowerLine.includes('role:') || 
            lowerLine.includes('position:') || 
            lowerLine.includes('job title:') ||
            lowerLine.includes('hiring for') ||
            lowerLine.includes('we are looking for')) {
            
            // Extract after the colon or keyword
            const match = line.match(/(?:role|position|job title|hiring for|we are looking for)\s*[:;]\s*(.+)/i);
            if (match) {
                return cleanRole(match[1]);
            }
        }
    }
    
    // If no role indicator found, check if first line looks like a plausible role title
    if (lines.length > 0) {
        const firstLine = lines[0];
        const isSentence = /\b(this is|i am|we are|just testing|am just|hello|please|test|random)\b/i.test(firstLine);
        const hasTitleWord = /\b(engineer|developer|designer|architect|lead|manager|analyst|specialist|consultant|administrator|scientist|director|vp|head|officer|intern|associate|programmer|qa|tester|devops|sre)\b/i.test(firstLine);
        
        if (!isSentence && (hasTitleWord || (firstLine.length < 50 && !firstLine.includes('.')))) {
            return cleanRole(firstLine);
        }
    }

    return 'Role not specified';
}

function cleanRole(role: string): string {
    return role
        .replace(/^at\s+/i, '') // Remove "at" from start
        .replace(/\s*[|•·-]\s*.*$/, '') // Remove extra details after separators
        .trim()
        .slice(0, 100);
}

// ============================================
// 2. EXTRACT RESPONSIBILITIES
// ============================================
function extractResponsibilities(text: string): string[] {
    // Find responsibilities section
    const section = findSection(text, [
        'responsibilities',
        'what you\'ll do',
        'key responsibilities',
        'duties',
        'role overview',
        'day-to-day',
        'you will be responsible for'
    ]);
    
    if (!section) {
        // Try to find bullet points anywhere
        return extractBulletPoints(text, 10);
    }
    
    // Extract bullet points from section
    let items = extractBulletPoints(section, 15);
    
    // If no bullet points, try to split by sentences
    if (items.length === 0) {
        items = section
            .split(/[.!?]\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 10 && s.length < 200)
            .slice(0, 10);
    }
    
    return items;
}

// ============================================
// 3. EXTRACT TECHNICAL REQUIREMENTS
// ============================================
function extractTechnicalRequirements(text: string): string[] {
    // 1. Dynamic structural section extraction (catches unlisted & custom skills under requirements/skills blocks)
    const structuralSkills = extractSkillsFromStructuredSections(text);

    // 2. Find requirements section if present
    const section = findSection(text, [
        'requirements',
        'must have',
        'technical skills',
        'required skills',
        'qualifications',
        'you should have',
        'what you\'ll need',
        'experience with',
        'skills required',
        'core requirements',
        'what we look for',
        'minimum qualifications'
    ]);
    
    let sectionSkills: string[] = [];
    if (section) {
        const vocabFromSection = extractSkillsFromText(section);
        const dynamicFromSection = extractSkillsFromStructuredSections(`Skills:\n${section}`);
        sectionSkills = [...vocabFromSection, ...dynamicFromSection];

        if (sectionSkills.length === 0) {
            const bullets = extractBulletPoints(section, 20);
            sectionSkills = bullets.flatMap(b => [
                ...extractSkillsFromText(b),
                ...extractSkillsFromStructuredSections(`Skills:\n${b}`)
            ]);
        }
    }

    // 3. Semantic Trigger Fallback: If no section header was found or both section and structural extraction were empty,
    // scan the text for requirement clauses (e.g. "proficient in Go", "experience with Kubernetes")
    let triggerSkills: string[] = [];
    if (sectionSkills.length === 0 && structuralSkills.length === 0) {
        triggerSkills = extractRequiredSkillsFromTriggers(text);
    }

    // 4. Combine structural, section, and trigger skills, deduplicate canonically
    let allSkills = deduplicateSkills([...structuralSkills, ...sectionSkills, ...triggerSkills]);

    // 5. Ultimate fallback if still no skills found: scan entire text for tech vocabulary
    if (allSkills.length === 0) {
        allSkills = deduplicateSkills(extractTechSkills(text));
    }
    
    return allSkills.slice(0, 20);
}

// ============================================
// 4. EXTRACT PREFERRED SKILLS
// ============================================
function extractPreferredSkills(text: string): string[] {
    // 1. Find preferred/nice-to-have section if present
    const section = findSection(text, [
        'nice to have',
        'preferred',
        'bonus',
        'good to have',
        'plus',
        'additional skills',
        'preferred qualifications',
        'bonus points'
    ]);
    
    let skills: string[] = [];

    if (section) {
        const vocab = extractSkillsFromText(section);
        const dynamic = extractSkillsFromStructuredSections(`Skills:\n${section}`);
        skills = [...vocab, ...dynamic];
        
        if (skills.length === 0) {
            const bullets = extractBulletPoints(section, 10);
            skills = bullets.flatMap(b => [
                ...extractSkillsFromText(b),
                ...extractSkillsFromStructuredSections(`Skills:\n${b}`)
            ]);
        }
    }

    // 2. Semantic Trigger Fallback: If no formal section, scan for bonus/preferred clauses
    if (skills.length === 0) {
        skills = extractPreferredSkillsFromTriggers(text);
    }
    
    return deduplicateSkills(skills).slice(0, 10);
}

/**
 * Semantic Fallback: Extracts skills from clauses containing requirement triggers
 * e.g., "looking for an engineer with Go and Kubernetes", "proficient in PostgreSQL"
 */
function extractRequiredSkillsFromTriggers(text: string): string[] {
    const requirementTriggerRegex = /\b(?:must have|require[ds]?|proficient in|experience (?:with|in)|hands-on|looking for|knowledge of|familiar with|stack (?:is|includes)|work(?:ing)? with|proven track record in|skilled in|competenc(?:y|ies) in|strong background in)\b/i;

    const clauses = text.split(/[.\n;•·▪◦‣➢➤►-]/).map(c => c.trim()).filter(c => c.length > 0);
    const extractedSkills: string[] = [];

    for (const clause of clauses) {
        if (requirementTriggerRegex.test(clause)) {
            const vocab = extractSkillsFromText(clause);
            const dynamic = extractSkillsFromStructuredSections(`Skills:\n${clause}`);
            extractedSkills.push(...vocab, ...dynamic);
        }
    }

    return deduplicateSkills(extractedSkills);
}

/**
 * Semantic Fallback: Extracts skills from clauses containing bonus/preferred triggers
 * e.g., "bonus if you know GraphQL", "nice to have: Docker"
 */
function extractPreferredSkillsFromTriggers(text: string): string[] {
    const preferredTriggerRegex = /\b(?:nice to have|good to have|preferred|bonus|plus|extra credit|ideally|not required but|advantageous|would be a plus)\b/i;

    const clauses = text.split(/[.\n;•·▪◦‣➢➤►]/).map(c => c.trim()).filter(c => c.length > 0);
    const extractedSkills: string[] = [];

    for (const clause of clauses) {
        if (preferredTriggerRegex.test(clause)) {
            const vocab = extractSkillsFromText(clause);
            const dynamic = extractSkillsFromStructuredSections(`Skills:\n${clause}`);
            extractedSkills.push(...vocab, ...dynamic);
        }
    }

    return deduplicateSkills(extractedSkills);
}

// ============================================
// 5. EXTRACT EDUCATION
// ============================================
function extractEducation(text: string): string[] {
    // Find education section
    const section = findSection(text, [
        'education',
        'qualifications',
        'academic',
        'degree',
        'b.tech',
        'b.sc',
        'm.tech',
        'm.sc',
        'bachelor',
        'master'
    ]);
    
    if (!section) {
        // Search entire text for degree names
        return extractDegreeNames(text);
    }
    
    // Extract education lines
    const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const education: string[] = [];
    
    for (const line of lines) {
        // Check if line contains degree-related words
        if (line.match(/degree|bachelor|master|b\.tech|m\.tech|b\.sc|m\.sc|b\.a|m\.a|phd|doctorate|diploma/i)) {
            education.push(cleanEducation(line));
        }
    }
    
    // If no education found in section, search entire text
    if (education.length === 0) {
        return extractDegreeNames(text);
    }
    
    return [...new Set(education)].slice(0, 5);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Deduplicate skills canonically using normalizeSkill
 */
function deduplicateSkills(skills: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const skill of skills) {
        const norm = normalizeSkill(skill);
        if (norm && !seen.has(norm)) {
            seen.add(norm);
            result.push(skill);
        }
    }
    return result;
}

/**
 * Find a section in the text by keywords
 */
function findSection(text: string, keywords: string[]): string | null {
    const lines = text.split('\n').map(l => l.trim());
    let foundIndex = -1;
    
    // Find the section header
    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (keywords.some(keyword => lowerLine.includes(keyword))) {
            foundIndex = i;
            break;
        }
    }
    
    if (foundIndex === -1) return null;
    
    // Get everything after the header until the next section
    const sectionLines: string[] = [];

    // If the header line itself contains content after a colon, include it
    const headerLine = lines[foundIndex];
    if (headerLine.includes(':')) {
        const afterColon = headerLine.split(/:(.+)/)[1]?.trim();
        if (afterColon) {
            sectionLines.push(afterColon);
        }
    }
    
    // Common section headers to stop at
    const stopHeaders = [
        'experience', 'education', 'skills', 'responsibilities',
        'requirements', 'qualifications', 'benefits', 'about',
        'company', 'culture', 'perks'
    ];
    
    for (let i = foundIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Check if this is a new section header
        const lowerLine = line.toLowerCase();
        if (stopHeaders.some(header => lowerLine.includes(header) && line.length < 50)) {
            // Check if it looks like a header (short, uppercase, or ends with colon)
            if (line.length < 40 || line === line.toUpperCase() || line.endsWith(':')) {
                break;
            }
        }
        
        // Skip lines that are just separators
        if (line.match(/^[-=#*]{3,}$/)) continue;
        
        sectionLines.push(line);
    }

    return sectionLines.join('\n') || null;
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string, maxItems: number = 15): string[] {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const bullets: string[] = [];
    
    for (const line of lines) {
        // Check if line starts with bullet point marker
        if (line.match(/^[•·▪◦‣➢➤►-]\s*/) || line.match(/^[0-9]+[.)]\s*/)) {
            const clean = line.replace(/^[•·▪◦‣➢➤►-]\s*/, '')
                             .replace(/^[0-9]+[.)]\s*/, '')
                             .trim();
            if (clean.length > 3) {
                bullets.push(clean);
            }
        }
    }
    
    return bullets.slice(0, maxItems);
}

/**
 * Extract skills from text (uses shared tech vocabulary)
 */
function extractSkillsFromText(text: string): string[] {
    return extractFromVocabulary(text);
}

/**
 * Extract tech skills from entire text (fallback)
 */
function extractTechSkills(text: string): string[] {
    const vocabSkills = extractSkillsFromText(text);
    const structuralSkills = extractSkillsFromStructuredSections(text);
    const skills = deduplicateSkills([...vocabSkills, ...structuralSkills]);
    
    // If no skills found, try splitting by commas in the text
    if (skills.length === 0) {
        const words = text.split(/[,;]\s*/)
            .map(w => w.trim())
            .filter(w => w.length > 0 && w.length < 30 && !w.match(/^\d+$/));
        
        const commonTech = ['React', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Angular', 'Vue'];
        for (const word of words) {
            if (commonTech.some(tech => word.toLowerCase().includes(tech.toLowerCase()))) {
                skills.push(word);
            }
        }
    }
    
    return deduplicateSkills(skills).slice(0, 20);
}

/**
 * Extract degree names from text
 */
function extractDegreeNames(text: string): string[] {
    const degrees: string[] = [];
    const degreePatterns = [
        /b\.?tech\s+(?:in\s+)?([a-z\s]+)/i,
        /m\.?tech\s+(?:in\s+)?([a-z\s]+)/i,
        /b\.?sc\s+(?:in\s+)?([a-z\s]+)/i,
        /m\.?sc\s+(?:in\s+)?([a-z\s]+)/i,
        /bachelor'?s\s+degree\s+(?:in\s+)?([a-z\s]+)/i,
        /master'?s\s+degree\s+(?:in\s+)?([a-z\s]+)/i,
        /b\.?a\s+(?:in\s+)?([a-z\s]+)/i,
        /m\.?a\s+(?:in\s+)?([a-z\s]+)/i,
        /mba\s+(?:in\s+)?([a-z\s]+)/i,
        /phd\s+(?:in\s+)?([a-z\s]+)/i,
        /doctorate\s+(?:in\s+)?([a-z\s]+)/i,
        /diploma\s+(?:in\s+)?([a-z\s]+)/i
    ];
    
    const lines = text.split('\n');
    for (const line of lines) {
        for (const pattern of degreePatterns) {
            const match = line.match(pattern);
            if (match) {
                const degree = match[1] ? `${match[0]}` : match[0];
                degrees.push(degree.trim());
                break;
            }
        }
    }
    
    return [...new Set(degrees)].slice(0, 5);
}

/**
 * Clean education text
 */
function cleanEducation(line: string): string {
    return line
        .replace(/^[•·▪◦‣➢➤►-]\s*/, '')
        .replace(/^[0-9]+[.)]\s*/, '')
        .trim()
        .slice(0, 100);
}

/**
 * Extracts minimum required years of experience from job description requirements
 * e.g., "5+ years of experience", "minimum 3 years of software engineering", "3-5 years"
 */
export function extractMinYearsExperience(text: string): number | undefined {
    if (!text) return undefined;

    const expRegex = /(?:minimum|at least|\b)(\d{1,2})\+?\s*(?:-\s*\d+\s*)?(?:years?|yrs?)(?:\s*of)?\s*(?:relevant|professional|software|engineering|hands-on|industry|work)?\s*experience/i;
    const match = text.match(expRegex);

    if (match) {
        const years = parseInt(match[1], 10);
        if (years >= 1 && years <= 25) {
            return years;
        }
    }

    return undefined;
}