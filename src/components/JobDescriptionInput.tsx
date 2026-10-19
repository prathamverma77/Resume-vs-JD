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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6 transition-colors shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
            Job Description
          </label>
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded font-mono">
            TEXT
          </span>
        </div>
        {value ? (
          <div className="flex items-center gap-3">
            <span
              className={`text-xs md:text-sm font-mono font-medium ${
                charCount > 30000
                  ? "text-red-600 font-bold"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {wordCount} words &bull; {charCount.toLocaleString()} chars
              {charCount > 30000 ? " (exceeds limit)" : ""}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs md:text-sm font-bold text-zinc-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300">
            Min 30 chars
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste role requirements, technical skills, and key responsibilities..."
        className="flex-1 w-full min-h-[250px] md:min-h-[270px] p-4 text-sm md:text-base text-zinc-950 dark:text-zinc-50 bg-zinc-50/70 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 focus:bg-white dark:focus:bg-zinc-900 resize-none leading-relaxed transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-400 font-sans"
      />
    </div>
  );
}
