import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-6 px-4 md:px-6 mt-16 backdrop-blur-sm transition-colors duration-200">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
            MatchEngine
          </span>
          <span className="text-slate-400 dark:text-slate-600">&bull;</span>
          <span className="text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} No-Login Resume Matcher
          </span>
        </div>

        {/* Footer Navigation Links */}
        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center justify-center gap-5 text-slate-500 dark:text-slate-400 text-xs"
        >
          <Link
            href="/#how-it-works"
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#faq"
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400">Crafted by</span>
          <a
            href="https://pratham-portfolio-sooty.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            Pratham Verma
          </a>
        </div>
      </div>
    </footer>
  );
}
