import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-900 text-slate-400 py-5 px-4 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span className="text-slate-300">
            MatchEngine &copy; {new Date().getFullYear()}
          </span>
          <span className="text-slate-700">&bull;</span>
          <span className="text-slate-400">Resume vs. JD Matcher</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Crafted by</span>
          <a
            href="https://pratham-portfolio-sooty.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Pratham Verma
          </a>
        </div>
      </div>
    </footer>
  );
}
