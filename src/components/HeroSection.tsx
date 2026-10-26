import React from "react";

export default function HeroSection() {
  return (
    <section className="text-center mb-9 max-w-3xl mx-auto pt-4 md:pt-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-3 leading-snug">
        Resume & Job Description{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Matcher
        </span>
      </h1>
      <p className="text-base md:text-lg font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
        Evaluate candidate keyword coverage, identify technical skill gaps, and audit ATS alignment in seconds.
      </p>
    </section>
  );
}
