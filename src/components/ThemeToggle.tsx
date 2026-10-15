"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by rendering a consistent layout until mounted
  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200/80 bg-slate-100/50 flex items-center justify-center opacity-70 ${className}`}
        aria-hidden="true"
      >
        <span className="w-4 h-4 rounded-full bg-slate-300 animate-pulse" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 cursor-pointer select-none
        ${
          isDark
            ? "bg-slate-800/90 text-amber-300 hover:text-amber-200 hover:bg-slate-750 border border-slate-700/80 shadow-xs shadow-black/20 hover:border-amber-400/40"
            : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/80 shadow-2xs hover:border-slate-300"
        }
        active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (shown when dark to toggle light) */}
        <svg
          className={`w-4 h-4 transition-all duration-500 transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-300"
              : "-rotate-90 scale-0 opacity-0 text-amber-500 absolute"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>

        {/* Moon Icon (shown when light to toggle dark) */}
        <svg
          className={`w-4 h-4 transition-all duration-500 transform ${
            !isDark
              ? "rotate-0 scale-100 opacity-100 text-slate-700 group-hover:text-blue-600"
              : "rotate-90 scale-0 opacity-0 text-slate-400 absolute"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold pr-1">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
