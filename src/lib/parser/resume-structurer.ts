// lib/resume-structurer.ts

export interface StructuredResume {
    skills: string[];
    email?: string;
    phone?: string;
}

/**
 * Extract structured information (skills, contact info) from resume text
 */
export function structureResume(text: string): StructuredResume {
    const skills = extractSkills(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);

    return { 
        skills,
        ...(email && { email }),
        ...(phone && { phone }),
    };
}

/**
 * Extract tech skills from text using comprehensive keywords & symbol-safe boundaries
 */
function extractSkills(text: string): string[] {
    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Core Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'React', 'React.js', 'Reactjs', 'Angular', 'Vue', 'Next.js', 'Nextjs', 'Node.js', 'Nodejs', 
        'Express', 'Express.js', 'Expressjs', 'Django', 'Flask', 'FastAPI',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'DynamoDB', 'Firebase',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux',
        'HTML', 'HTML-5', 'HTML5', 'CSS', 'SASS', 'Tailwind', 'Tailwind CSS', 'Bootstrap',
        'GraphQL', 'REST API', 'RESTful API', 'RESTful APIs', 'Redux', 'Zustand', 'JWT', 'OAuth',
        'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Webpack', 'Vite', 'Vercel',
        'MERN', 'MERN Stack', 'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Data Science'
    ];

    const foundSkills: string[] = [];

    for (const skill of skillKeywords) {
        if (hasSkillMatch(skill, text)) {
            foundSkills.push(normalizeSkillName(skill));
        }
    }

    // Return unique skills sorted alphabetically
    return Array.from(new Set(foundSkills)).sort();
}

/**
 * Safely check if a skill exists in text, accounting for special characters like +, #, .
 */
function hasSkillMatch(skill: string, text: string): boolean {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `(?:^|[^a-zA-Z0-9#+.-])${escaped}(?:$|[^a-zA-Z0-9#+.-])`;
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
}

/**
 * Normalize skill variations into standard display names
 */
function normalizeSkillName(skill: string): string {
    const lower = skill.toLowerCase();
    if (lower === 'reactjs' || lower === 'react.js') return 'React';
    if (lower === 'nextjs' || lower === 'next.js') return 'Next.js';
    if (lower === 'nodejs' || lower === 'node.js') return 'Node.js';
    if (lower === 'expressjs' || lower === 'express.js') return 'Express.js';
    if (lower === 'tailwind css') return 'Tailwind CSS';
    if (lower === 'html-5' || lower === 'html5') return 'HTML5';
    if (lower === 'core java') return 'Java';
    if (lower === 'restful api' || lower === 'restful apis') return 'REST API';
    if (lower === 'mern stack') return 'MERN Stack';
    return skill;
}

/**
 * Extract email address from text
 */
function extractEmail(text: string): string | undefined {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : undefined;
} 

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string | undefined {
    const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return match ? match[0] : undefined;
}