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
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="inline-block text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          Workflow
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          How it works
        </h2>
        <p className="text-sm md:text-base font-normal text-zinc-600 dark:text-zinc-300 mt-1.5">
          Fast, deterministic keyword alignment in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item) => (
          <div
            key={item.num}
            className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 bg-white dark:bg-zinc-900 transition-all flex flex-col items-center text-center shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110">
              <span className="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {item.num}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
