"use client";

import React from "react";
import { ScoreTheme, formatFileSize } from "./types";

interface ReportHeaderProps {
  role?: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  email?: string;
  phone?: string;
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
    </div>
  );
}

