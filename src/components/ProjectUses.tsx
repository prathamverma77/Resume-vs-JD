"use client";

import React from "react";

interface UseCaseCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  highlights: string[];
  icon: React.ReactNode;
}

const useCases: UseCaseCard[] = [
  {
    id: "job-seekers",
    title: "For Job Seekers & Applicants",
    badge: "Resume Optimization",
    description:
      "Bridge the gap between your resume and target job descriptions. Uncover missing keywords, skill gaps, and improve your ATS score before applying.",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    iconColor: "text-white",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    badgeText: "Candidate Tool",
    highlights: [
      "Instant ATS compatibility score",
      "Missing skills & keyword identification",
      "Actionable recommendations to boost match rate",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "recruiters",
    title: "For Recruiters & Talent Acquisition",
    badge: "Fast-Track Screening",
    description:
      "Accelerate candidate shortlisting by comparing incoming resumes against complex job requirements in seconds instead of reading line-by-line.",
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    iconColor: "text-white",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    badgeText: "Recruiter Efficiency",
    highlights: [
      "Automated candidate-JD match score",
      "Quick qualification verification",
      "Reduced time-to-hire & manual effort",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "career-coaches",
    title: "For Career Coaches & Mentors",
    badge: "Client Guidance",
    description:
      "Empower your clients with data-driven insights. Show candidates exactly how their experience aligns with current industry expectations.",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    iconColor: "text-white",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    badgeText: "Career Advisory",
    highlights: [
      "Objective skills matrix & gap report",
      "Clear positioning feedback for target roles",
      "Benchmark resume strength across industries",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    id: "hr-teams",
    title: "For HR Teams & Hiring Managers",
    badge: "Standardized Evaluation",
    description:
      "Standardize candidate screening across teams. Establish objective benchmarks to assess candidate fit based on job requirements.",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    iconColor: "text-white",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    badgeText: "Hiring Standard",
    highlights: [
      "Consistent candidate scoring criteria",
      "Unbiased skills qualification check",
      "Exportable match analysis for hiring loops",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export default function ProjectUses() {
  return (
    <section className="w-full mt-14 mb-8 pt-10 border-t border-slate-200/80">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>What This Project Is About</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
          Key Uses & Purpose of MatchEngine
        </h2>
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
          MatchEngine is an AI-powered resume analysis engine built to align candidate qualifications with job descriptions. Here is how different users leverage this platform.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {useCases.map((useCase) => (
          <div
            key={useCase.id}
            className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient subtle glow on hover */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

            <div>
              {/* Card top banner */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl ${useCase.iconBg} ${useCase.iconColor} flex items-center justify-center shrink-0 shadow-md shadow-slate-200 group-hover:scale-105 transition-transform duration-200`}>
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {useCase.title}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {useCase.badge}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${useCase.badgeBg} shrink-0`}>
                  {useCase.badgeText}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
                {useCase.description}
              </p>

              {/* Highlights checklist */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Key Capabilities
                </p>
                <ul className="space-y-1.5">
                  {useCase.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works 3-step banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="max-w-3xl mx-auto text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
            Quick Workflow
          </span>
          <h3 className="text-xl md:text-2xl font-bold mt-2 text-white">
            How MatchEngine Works in 3 Simple Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-2.5">
              1
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Upload Resume</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Drop your candidate resume in PDF or DOCX format for instant text extraction.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-2.5">
              2
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Paste Job Description</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provide target job posting requirements, key skills, and experience criteria.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-2.5">
              3
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Get AI Insights</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Receive match score, skill breakdown, missing keywords, and tailored recommendations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
