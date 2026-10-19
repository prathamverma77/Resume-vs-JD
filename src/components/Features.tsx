import React from "react";

export default function Features() {
  const capabilities = [
    {
      title: "Structural Skill Extraction",
      description:
        "Dynamically captures emerging and unlisted tools (e.g., Pinecone, Supabase) directly from resume and job sections.",
      tag: "Dynamic",
    },
    {
      title: "Acronym & Synonym Resolution",
      description:
        "Normalizes real-world variations like AWS vs Amazon Web Services, K8s vs Kubernetes, and Node.js vs NodeJS.",
      tag: "Normalization",
    },
    {
      title: "Deterministic Scoring",
      description:
        "Applies a transparent weighted formula (75% required / 25% preferred) with Dice-coefficient fuzzy matching.",
      tag: "Zero-AI",
    },
    {
      title: "100% In-Memory Privacy",
      description:
        "Processes text entirely in ephemeral memory. No database, no file retention, and zero third-party AI keys.",
      tag: "Secure",
    },
  ];

  return (
    <section id="features" className="w-full mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20">
      <div className="mb-6">
        <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Architecture
        </span>
        <h2 className="text-lg md:text-xl font-bold text-zinc-950 dark:text-white tracking-tight mt-1">
          Engine capabilities
        </h2>
        <p className="text-sm md:text-base font-normal text-zinc-700 dark:text-zinc-200 mt-1">
          Engineered for fast, reliable keyword audits without AI API latency or cost.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {capabilities.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 bg-white dark:bg-zinc-900 transition-colors flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm md:text-base font-bold text-zinc-950 dark:text-white">
                  {item.title}
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
              <p className="text-sm font-normal text-zinc-700 dark:text-zinc-200 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
