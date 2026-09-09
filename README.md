# 🎯 MatchEngine — Resume vs. Job Description Matcher

An intelligent, full-stack Next.js web application designed to evaluate candidate resume compatibility against target job descriptions. **MatchEngine** parses PDF resumes, extracts key candidate credentials and skills, analyzes job requirement specifications, and generates a detailed compatibility report with actionable recommendations.

---

## ✨ Features

- 📄 **PDF Resume Parsing**: Server-side parsing of PDF resumes to extract raw text, contact information (email & phone), and technical skills.
- 🎯 **Job Description Intelligence**: Smart pattern extraction to identify target role, key responsibilities, mandatory technical requirements, preferred skills, and educational qualifications.
- 📊 **Weighted Scoring Engine**:
  - **75% Weight**: Mandatory Technical Requirements match.
  - **25% Weight**: Preferred / Nice-to-Have skills match.
- 🏷️ **Categorized Match Levels**:
  - 🟢 **80% - 100%**: Excellent Match
  - 🔵 **60% - 79%**: Good Match
  - 🟡 **40% - 59%**: Moderate Match
  - 🔴 **0% - 39%**: Low Match
- 🔍 **Visual Skill Breakdown**:
  - **Matching Skills**: Highlights skills present in both resume and job requirements.
  - **Missing Required Skills**: Pinpoints critical technical gaps.
  - **Missing Preferred Skills**: Identifies secondary skill gaps.
- 💡 **Actionable Recommendations**: Automated, tailored feedback advising candidates how to improve resume alignment for the role.
- 🎨 **Modern & Responsive UI**: Clean interface built with modern CSS/Tailwind, interactive drag-and-drop file upload, animated score gauges, and seamless state transitions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Extraction**: [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
- **Icons**: Inline SVG / Heroicons design system

---

## 📁 Project Architecture

```
resume-vs-jd/
├── public/                     # Static assets & public files
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts   # Unified POST API route for file & text analysis
│   │   ├── globals.css         # Global design tokens and styles
│   │   ├── layout.tsx          # Main root layout wrapper
│   │   └── page.tsx            # Main application interface
│   ├── components/
│   │   └── AnalysisResult.tsx  # Detailed compatibility report component
│   ├── lib/
│   │   ├── parser/
│   │   │   ├── pdf-parser.ts   # Node pdf-parse wrapper for file extraction
│   │   │   ├── resume-structurer.ts # Extracts skills, email, phone from raw text
│   │   │   └── jd-parser.ts    # Parses role, requirements & responsibilities from JD
│   │   └── scoring/
│   │       └── score-engine.ts # Calculates compatibility scores & recommendations
│   └── types/
│       └── analysis.ts         # TypeScript interfaces and API payload types
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ How It Works

### 1. Resume Parsing (`src/lib/parser/`)
- **PDF Text Extraction**: Uses `pdf-parse` to convert uploaded `.pdf` documents into plain text.
- **Entity Extraction**: Uses safe regex matching to capture emails and phone numbers.
- **Skill Keyword Normalization**: Matches skills against a broad technology vocabulary (React, TypeScript, Node.js, Docker, AWS, Python, etc.) while preventing false positives.

### 2. Job Description Parsing (`src/lib/parser/jd-parser.ts`)
- **Section Detection**: Scans job descriptions for key headers such as *Requirements*, *Responsibilities*, *Nice to Have*, and *Education*.
- **Role Identification**: Extracts the position title from opening lines or headers.

### 3. Scoring Engine (`src/lib/scoring/score-engine.ts`)
$$\text{Overall Score} = (\text{Technical Score} \times 0.75) + (\text{Preferred Score} \times 0.25)$$

Generates targeted recommendations based on missing mandatory vs. preferred skills to give candidates concrete optimization points.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version `18.x` or higher
- `npm`, `yarn`, `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/resume-vs-jd.git
   cd resume-vs-jd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔌 API Reference

### `POST /api/analyze`

Processes a candidate's resume and job description.

#### Request Format
- **Content-Type**: `multipart/form-data`

#### Form Data Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `resume` | `File` | **Yes** | Candidate resume file (`.pdf`, max 5MB) |
| `jobDescription` | `string` / `File` | No | Target job description raw text or file |

#### Example Response Body
```json
{
  "success": true,
  "message": "Resume and Job Description processed successfully",
  "matchAnalysis": {
    "overallScore": 85,
    "matchLevel": "Excellent Match",
    "technicalMatchScore": 90,
    "preferredMatchScore": 70,
    "matchingSkills": ["React", "TypeScript", "Node.js", "Tailwind CSS"],
    "missingRequiredSkills": ["Docker"],
    "missingPreferredSkills": ["GraphQL"],
    "recommendations": [
      "Add core required skills to your resume: Docker.",
      "Highlight preferred skills if you have experience with them: GraphQL."
    ]
  },
  "resume": {
    "fileInfo": { "name": "Resume.pdf", "size": 120450, "type": "application/pdf" },
    "textLength": 2400,
    "pageCount": 1,
    "extractedText": "...",
    "structuredData": {
      "skills": ["React", "TypeScript", "Node.js"],
      "email": "candidate@example.com",
      "phone": "+1 (555) 019-2834"
    }
  },
  "jobDescription": {
    "rawText": "...",
    "parsedData": {
      "role": "Frontend Developer",
      "responsibilities": ["Build responsive UIs", "Optimize web applications"],
      "technical_req": ["React", "TypeScript", "Node.js", "Docker"],
      "preferred_skills": ["GraphQL"],
      "education": ["Bachelor in Computer Science"]
    }
  }
}
```

---

## 👤 Author

Developed with ❤️ by **[Pratham Verma](https://pratham-portfolio-sooty.vercel.app/)**

---

## 📄 License

This project is licensed under the MIT License - feel free to customize and expand!
