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
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
            2
          </span>
          <label className="text-sm font-bold text-slate-900 tracking-tight">
            Step 2: Add Job Description
          </label>
        </div>
        {value ? (
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-medium ${
                charCount > 30000 ? "text-rose-600 font-bold" : "text-slate-400"
              }`}
            >
              {wordCount} words &bull; {charCount.toLocaleString()} chars
              {charCount > 30000 ? " (exceeds 30k limit)" : ""}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            Min 30 characters
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description, required skills, and key responsibilities here..."
        className="flex-1 w-full min-h-[250px] md:min-h-[290px] p-4 text-sm text-slate-800 bg-slate-50/60 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none leading-relaxed transition-all placeholder:text-slate-400 font-sans"
      />
    </div>
  );
}
