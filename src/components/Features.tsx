import React from "react";

export default function Features() {
  const capabilities = [
    {
      title: "Structural Skill Extraction",
      description:
        "Dynamically captures emerging and unlisted tools (e.g., Pinecone, Supabase) directly from resume and job sections.",
    },
    {
      title: "Acronym & Synonym Resolution",
      description:
        "Normalizes real-world variations like AWS vs Amazon Web Services, K8s vs Kubernetes, and Node.js vs NodeJS.",
    },
    {
      title: "Deterministic Scoring",
      description:
        "Applies a transparent weighted formula (75% required / 25% preferred) with Dice-coefficient fuzzy matching.",
    },
    {
      title: "100% In-Memory Privacy",
      description:
        "Processes text entirely in ephemeral memory. No database, no file retention, and zero third-party AI keys.",
    },
  ];

  return (
    <section id="features" className="w-full mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-950 dark:text-white tracking-tight">
          Engine capabilities
        </h2>
        <p className="text-base font-normal text-zinc-600 dark:text-zinc-300 mt-1.5">
          Engineered for fast, reliable keyword audits without AI API latency or cost.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {capabilities.map((item, idx) => (
          <div
            key={idx}
            className="p-5 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 bg-white dark:bg-zinc-900 transition-colors flex flex-col justify-between shadow-2xs"
          >
            <div>
              <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-[15px] font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
