"use client";

import React from "react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl p-6 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-[#141514] dark:text-[#F4F2EE]">
          Job Description
        </label>
        {value ? (
          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-mono ${
                charCount > 30000
                  ? "text-[#B83232] dark:text-[#E55353] font-medium"
                  : "text-[#5C5E58] dark:text-[#9E9F97]"
              }`}
            >
              {wordCount} words &bull; {charCount.toLocaleString()} chars
              {charCount > 30000 ? " (exceeds limit)" : ""}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] font-medium text-[#82847E] hover:text-[#B83232] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#82847E] dark:text-[#72736C]">
            Min 30 chars
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste role requirements, key responsibilities, qualifications, and preferred technical skills..."
        className="flex-1 w-full min-h-[340px] sm:min-h-[380px] p-5 text-xs md:text-sm text-[#141514] dark:text-[#F4F2EE] bg-[#FAF7F2]/60 dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] rounded-xl focus:outline-none focus:border-[#141514] dark:focus:border-[#F4F2EE] focus:bg-white dark:focus:bg-[#1B1C1A] resize-none leading-relaxed transition-colors placeholder:text-[#82847E] font-sans"
      />
    </div>
  );
}
