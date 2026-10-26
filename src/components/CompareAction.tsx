"use client";

import React from "react";

interface CompareActionProps {
  isAnalyzing: boolean;
  onCompare: () => void;
  errorMsg: string | null;
}

export default function CompareAction({
  isAnalyzing,
  onCompare,
  errorMsg,
}: CompareActionProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-4">
      <button
        type="button"
        onClick={onCompare}
        disabled={isAnalyzing}
        className="w-full sm:w-80 h-12 rounded-xl text-white font-semibold text-base tracking-wide bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
      >
        {isAnalyzing ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Analyzing compatibility...</span>
          </>
        ) : (
          <>
            <span>Analyze Match</span>
            <svg
              className="w-4 h-4 text-blue-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-3.5 px-4 py-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2.5 animate-fade-in max-w-xl">
          <svg
            className="w-4 h-4 text-red-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
