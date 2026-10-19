import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Upload Resume",
      desc: "Upload candidate PDF. Extracted in-memory without persistent cloud storage.",
    },
    {
      num: "02",
      title: "Provide Requirements",
      desc: "Paste job description. Identifies required tech, acronyms, and preferred skills.",
    },
    {
      num: "03",
      title: "Inspect Match",
      desc: "Review compatibility score, missing qualifications, and prioritized recommendations.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20">
      <div className="mb-6">
        <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Workflow
        </span>
        <h2 className="text-lg md:text-xl font-bold text-zinc-950 dark:text-white tracking-tight mt-1">
          How it works
        </h2>
        <p className="text-sm md:text-base font-normal text-zinc-700 dark:text-zinc-200 mt-1">
          Fast, deterministic keyword alignment in three steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item) => (
          <div
            key={item.num}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 bg-white dark:bg-zinc-900 transition-colors flex flex-col justify-between shadow-2xs"
          >
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {item.num}
              </span>
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-zinc-950 dark:text-white mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm font-normal text-zinc-700 dark:text-zinc-200 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
