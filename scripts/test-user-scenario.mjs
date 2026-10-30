import { parseJD } from "../src/lib/parser/jd-parser.ts";
import { structureResume } from "../src/lib/parser/resume-structurer.ts";
import { calculateScore } from "../src/lib/scoring/score-engine.ts";

const sampleResume = `
ALEX MORGAN
Software Engineer
alex.morgan@email.com | (555) 123-4567 | Austin, TX

PROFESSIONAL SUMMARY
Software Engineer with 4+ years of experience building web applications and REST APIs using Python, JavaScript, and React. Experienced in AWS cloud deployments, CI/CD pipelines, and Agile development. Strong background in backend development, database design, and cross-functional collaboration. Passionate about clean code, automated testing, and scalable system design.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: React, Node.js, Django, Flask
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Jenkins, GitHub Actions
Databases: PostgreSQL, MySQL, MongoDB
Tools: Git, Jira, Postman, VS Code
Concepts: REST APIs, Microservices, Agile/Scrum, Unit Testing, CI/CD

PROFESSIONAL EXPERIENCE
Software Engineer II — TechNova Solutions, Austin, TX
Jan 2022 – Present
Developed and maintained REST APIs in Python (Django) serving 50K+ daily requests
Built responsive front-end features in React and TypeScript, improving page load time by 30%
Deployed containerized applications to AWS using Docker and Jenkins CI/CD pipelines
Designed and optimized PostgreSQL schemas, reducing query times by 40%
Collaborated in Agile/Scrum teams, participating in sprint planning, code reviews, and standups
Wrote unit and integration tests, raising code coverage from 55% to 85%

Software Engineer I — BrightApps Inc., Dallas, TX
Jun 2020 – Dec 2021
Built backend services in Node.js and Python for a customer-facing web platform
Integrated third-party APIs and implemented authentication (OAuth 2.0, JWT)
Migrated legacy services to AWS Lambda, cutting infrastructure costs by 20%
Worked with product and QA teams in an Agile environment to deliver features on schedule

EDUCATION
B.S. in Computer Science — University of Texas at Austin, 2020
GPA: 3.6/4.0

PROJECTS
TaskFlow — Full-stack task management app (React + Node.js + PostgreSQL), deployed on AWS
API Monitor — Python tool for monitoring REST API uptime with alerting via Slack

CERTIFICATIONS
AWS Certified Cloud Practitioner (2023)
`;

const sampleJD = `
Job Title: Software Engineer (Mid-Level)
Company: CloudBridge Technologies
Location: Austin, TX (Hybrid)
Experience: 3–5 years

ABOUT THE ROLE
CloudBridge Technologies is seeking a Software Engineer to join our platform team. You will design, build, and maintain scalable web applications and APIs in a cloud-first, Agile environment. This role involves close collaboration with product, design, and QA teams.

RESPONSIBILITIES
Design and develop REST APIs and backend services using Python (Django/Flask)
Build and maintain front-end features using React and JavaScript/TypeScript
Deploy and manage applications on AWS (EC2, S3, Lambda)
Implement and maintain CI/CD pipelines using Docker and Jenkins/GitHub Actions
Work with PostgreSQL and other relational databases; optimize queries and schemas
Participate in Agile/Scrum ceremonies — sprint planning, standups, retrospectives
Write unit and integration tests and participate in peer code reviews
Collaborate with cross-functional teams to translate requirements into technical solutions

REQUIRED QUALIFICATIONS
3–5 years of software engineering experience
Proficiency in Python and JavaScript/TypeScript
Experience with React and modern front-end development
Hands-on experience with AWS cloud services
Experience with Docker, CI/CD pipelines, and Git
Strong knowledge of REST API design and relational databases (PostgreSQL/MySQL)
Familiarity with Agile/Scrum development practices
Bachelor's degree in Computer Science or related field

NICE-TO-HAVE (these are the ~30–35% gaps)
Kubernetes experience
GraphQL API development
Terraform / Infrastructure-as-Code
Kafka or event-driven architecture experience
Go or Java programming experience
Experience with observability tools (Datadog, Prometheus, Grafana)
`;

console.log("=== 1. PARSING JD ===");
const jdResult = parseJD(sampleJD);
console.log("Extracted Role:", jdResult.role);
console.log("Extracted Min Years:", jdResult.minYearsExperience);
console.log("Extracted Responsibilities count:", jdResult.responsibilities.length);
console.log("Extracted Responsibilities:", jdResult.responsibilities);
console.log("Extracted Technical Req:", jdResult.technical_req);
console.log("Extracted Preferred Skills:", jdResult.preferred_skills);

console.log("\n=== 2. STRUCTURING RESUME ===");
const structuredResume = structureResume(sampleResume);
console.log("Candidate Name/Contact:", structuredResume.email, structuredResume.phone);
console.log("Candidate Total Years:", structuredResume.yearsOfExperience);
console.log("Candidate Skills:", structuredResume.skills);

console.log("\n=== 3. SCORING ENGINE ===");
const matchScore = calculateScore(structuredResume, jdResult);

console.log("Overall Score:", matchScore.overallScore + "%");
console.log("Match Level:", matchScore.matchLevel);
console.log("Core Technical Score:", matchScore.technicalMatchScore + "%");
console.log("Preferred Match Score:", matchScore.preferredMatchScore + "%");
console.log("Matching Skills (" + matchScore.matchingSkills.length + "):", matchScore.matchingSkills);
console.log("Missing Required (" + matchScore.missingRequiredSkills.length + "):", matchScore.missingRequiredSkills);
console.log("Missing Preferred (" + matchScore.missingPreferredSkills.length + "):", matchScore.missingPreferredSkills);
console.log("Recommendations:", matchScore.recommendations);
