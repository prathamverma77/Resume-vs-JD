"use client";

import React from "react";

interface FeatureCard {
  title: string;
  description: string;
  iconBg: string;
  icon: React.ReactNode;
}

const features: FeatureCard[] = [
  {
    title: "Calculate Match Score",
    description: "Compare a resume against any job description to get an instant overall compatibility percentage and alignment summary.",
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100/80",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Find Missing Keywords",
    description: "Identify essential technical skills, tools, or qualifications in the job posting that are missing from the candidate's resume.",
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100/80",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Resume Improvement Tips",
    description: "Get practical, actionable feedback on how to rewrite or highlight relevant experience for the target role.",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/80",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Save Screening Time",
    description: "Quickly evaluate candidate fit without manually reading through lengthy job requirements and individual CVs.",
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100/80",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function ProjectUses() {
  return (
    <section className="w-full mt-14 pt-10 border-t border-slate-200/80">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          What can you use this tool for?
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-1.5 leading-relaxed">
          Simple ways to check resume alignment, find skill gaps, and prepare applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}>
                {item.icon}
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
