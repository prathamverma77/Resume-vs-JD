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
    <div className="w-full flex flex-col items-center justify-center mt-2">
      <button
        type="button"
        onClick={onCompare}
        disabled={isAnalyzing}
        className="w-full sm:w-72 h-12 rounded-full text-white dark:text-[#111210] font-medium text-xs sm:text-sm tracking-wide bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:hover:bg-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
      >
        {isAnalyzing ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white dark:text-[#111210]"
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
            <span>Evaluating compatibility...</span>
          </>
        ) : (
          <>
            <span>Analyze Match Compatibility</span>
          </>
        )}
      </button>

      {errorMsg ? (
        <div className="mt-4 px-4 py-2.5 bg-[#B83232]/10 border border-[#B83232]/25 rounded-xl text-xs font-medium text-[#B83232] dark:text-[#E55353] flex items-center gap-2 max-w-xl text-left">
          <svg
            className="w-4 h-4 shrink-0"
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
      ) : (
        <p className="mt-3.5 text-xs text-[#82847E] dark:text-[#72736C] font-mono">
          Ephemeral in-memory evaluation &bull; Zero data retained
        </p>
      )}
    </div>
  );
}
