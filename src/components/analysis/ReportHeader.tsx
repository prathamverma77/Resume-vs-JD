"use client";

import React from "react";
import { ScoreTheme, formatFileSize } from "./types";
import { CandidateLinks } from "@/types/analysis";

interface ReportHeaderProps {
  role?: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  email?: string;
  phone?: string;
  links?: CandidateLinks;
  candidateYears?: number;
  jdMinYears?: number;
  matchedSkillsCount: number;
  totalReqCount: number;
  totalPrefCount: number;
  theme: ScoreTheme;
  copied: boolean;
  onCopyReport: () => void;
  onCompareAgain: () => void;
}

export default function ReportHeader({
  role,
  fileName,
  fileSize,
  pageCount,
  email,
  phone,
  links,
  candidateYears,
  jdMinYears,
  matchedSkillsCount,
  totalReqCount,
  totalPrefCount,
  theme,
  copied,
  onCopyReport,
  onCompareAgain,
}: ReportHeaderProps) {
  const hasLinks = links && Object.values(links).some(Boolean);

  const getCleanDomain = (url: string) => {
    try {
      return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    } catch {
      return url;
    }
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:p-0 print:pb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#141514]/5 dark:bg-white/10 text-[#5C5E58] dark:text-[#A8A9A2] border border-[#EAE4DC] dark:border-[#2F302C]">
              ATS Compatibility Audit
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#5C5E58] dark:text-[#A8A9A2] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              100% In-Memory &bull; Zero Cloud Retention
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-[-0.025em] text-[#141514] dark:text-[#F4F2EE] leading-tight">
            {role && role !== "Role not specified" && role !== "Not specified"
              ? role
              : "Target Role Compatibility Report"}
          </h1>

          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-2 font-sans leading-relaxed">
            Deterministic parsing and 3-tier weighted evaluation of candidate skills, qualifications, and seniority.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onCopyReport}
            className="px-4 py-2.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] hover:bg-[#F3ECE4] dark:bg-[#222320] dark:hover:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Report Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] hover:bg-[#F3ECE4] dark:bg-[#222320] dark:hover:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.672-2.03-1.28-2.829H4.5A2.25 2.25 0 002.25 13.25v4.5A2.25 2.25 0 004.5 20h15a2.25 2.25 0 002.25-2.25v-4.5A2.25 2.25 0 0019.5 11H18.56a8.887 8.887 0 01-1.28 2.829M12 15V3m0 0l3 3m-3-3L9 6" />
            </svg>
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={onCompareAgain}
            className="px-5 py-2.5 text-xs font-semibold rounded-full bg-[#141514] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#141514] dark:hover:bg-white text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-6 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
            Candidate Resume
          </span>
          <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] truncate block" title={fileName}>
            {fileName}
          </span>
          <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
            {formatFileSize(fileSize)} &bull; {pageCount} page(s)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
            Contact Verified
          </span>
          <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] truncate block" title={email || "None"}>
            {email || "No email parsed"}
          </span>
          <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
            {phone || "No phone detected"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
            Seniority & Tenure
          </span>
          <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] block">
            {candidateYears !== undefined
              ? `${candidateYears}+ Years Experience`
              : "Timeline not specified"}
          </span>
          <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
            {jdMinYears !== undefined ? `Job requests ${jdMinYears}+ yrs` : "No JD minimum specified"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
            Skill Alignment
          </span>
          <span className={`font-semibold block ${theme.textColor}`}>
            {matchedSkillsCount} Skills Matched
          </span>
          <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
            {totalReqCount} Required &bull; {totalPrefCount} Preferred
          </span>
        </div>
      </div>

      {/* Social & Portfolio Intel Strip */}
      <div className="mt-5 pt-4 border-t border-[#EAE4DC] dark:border-[#2F302C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#A8A9A2]">
            Online Presence &amp; Code Intel
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasLinks ? (
            <>
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-xs shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                  title={`GitHub: ${links.github}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}

              {links.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077B5]/10 text-[#0077B5] dark:bg-[#0077B5]/20 dark:text-[#70B5F9] border border-[#0077B5]/30 font-medium text-xs shadow-2xs hover:bg-[#0077B5]/15 transition-all cursor-pointer"
                  title={`LinkedIn: ${links.linkedin}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.55a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}

              {links.portfolio && (
                <a
                  href={links.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/30 font-medium text-xs shadow-2xs hover:bg-purple-500/15 transition-all cursor-pointer"
                  title={`Portfolio: ${links.portfolio}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                  </svg>
                  <span>{getCleanDomain(links.portfolio)}</span>
                </a>
              )}

              {links.leetcode && (
                <a
                  href={links.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-medium text-xs shadow-2xs hover:bg-amber-500/15 transition-all cursor-pointer"
                  title={`LeetCode: ${links.leetcode}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span>LeetCode</span>
                </a>
              )}

              {links.twitter && (
                <a
                  href={links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-medium text-xs shadow-2xs hover:opacity-80 transition-all cursor-pointer"
                  title={`X/Twitter: ${links.twitter}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X / Twitter</span>
                </a>
              )}
            </>
          ) : (
            <span className="text-[11px] text-[#82847E] dark:text-[#72736C] italic font-sans">
              No developer links (GitHub, LinkedIn, Portfolio) detected in candidate header
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
