"use client";

import React from "react";

interface NavbarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export default function Navbar({ showBack, onBack }: NavbarProps) {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-3.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/20 tracking-tight">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              MatchEngine
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
              Resume vs. JD AI
            </span>
          </div>
        </div>

        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            &larr; Back to Editor
          </button>
        )}
      </div>
    </header>
  );
}
