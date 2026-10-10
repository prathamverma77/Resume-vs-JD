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
    <div className="w-full flex flex-col items-center justify-center mt-2 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
          3
        </span>
        <span>Step 3: Analyze Compatibility</span>
      </div>
      <button
        type="button"
        onClick={onCompare}
        disabled={isAnalyzing}
        className="w-full md:w-80 h-12 rounded-xl text-white font-semibold text-sm tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
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
            <span>Analyzing Compatibility...</span>
          </>
        ) : (
          <>
            <span>Compare & Match</span>
            <svg
              className="w-4 h-4"
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
        <div className="mt-3 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-fade-in">
          <svg
            className="w-4 h-4 text-rose-500 shrink-0"
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
          {errorMsg}
        </div>
      )}
    </div>
  );
}
