"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export default function Navbar({ showBack, onBack }: NavbarProps) {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-3.5 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shadow-blue-500/25 transition-transform group-hover:scale-105">
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base md:text-lg tracking-tight text-zinc-950 dark:text-white">
              MatchEngine
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden sm:flex items-center gap-7 text-sm md:text-base font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Link
            href="/#how-it-works"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#features"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Capabilities
          </Link>
          <Link
            href="/#faq"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>New Analysis</span>
            </button>
          ) : (
            <a
              href="#analyzer"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors shadow-xs shadow-blue-500/25 cursor-pointer"
            >
              Match Resume
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
