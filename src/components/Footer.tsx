import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-8 px-4 md:px-6 mt-16 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-4 text-sm font-normal">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-950 dark:text-white">
            MatchEngine
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
          <span>&copy; {new Date().getFullYear()} In-Memory Parser</span>
        </div>

        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center justify-center gap-6 text-zinc-600 dark:text-zinc-300 font-medium"
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
          <Link
            href="/privacy-policy"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy
          </Link>
        </nav>

        <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <span>By</span>
          <a
            href="https://pratham-portfolio-sooty.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors font-semibold"
          >
            Pratham Verma
          </a>
        </div>
      </div>
    </footer>
  );
}
