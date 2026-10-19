import React from "react";

export default function HeroSection() {
  return (
    <section className="text-center mb-9 max-w-3xl mx-auto pt-6 md:pt-8">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/90 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs md:text-sm font-semibold mb-4 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
        <span>Local in-memory parser &bull; Zero external API keys or cloud storage</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-3.5 leading-tight">
        Resume & Job Description{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Matcher
        </span>
      </h1>
      <p className="text-base md:text-lg font-normal text-zinc-700 dark:text-zinc-200 leading-relaxed max-w-2xl mx-auto">
        Evaluate candidate keyword coverage, identify technical skill gaps, and audit ATS alignment in seconds.
      </p>
    </section>
  );
}
