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
        <label className="text-sm font-semibold text-zinc-950 dark:text-white">
          Job Description
        </label>
        {value ? (
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${
                charCount > 30000
                  ? "text-red-600 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {wordCount} words &bull; {charCount.toLocaleString()} chars
              {charCount > 30000 ? " (exceeds limit)" : ""}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm font-semibold text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Min 30 chars
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste role requirements, technical skills, and key responsibilities..."
        className="flex-1 w-full min-h-[250px] md:min-h-[270px] p-4 text-sm md:text-base text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 resize-none leading-relaxed transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans"
      />
    </div>
  );
}
