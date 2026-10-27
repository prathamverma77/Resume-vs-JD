import React from "react";

export default function HeroSection() {
  return (
    <section className="relative w-full pt-6 pb-12 md:pt-12 md:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Expressive Editorial Headline & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] text-[#141514] dark:text-[#F4F2EE] leading-[1.08] tracking-[-0.025em] max-w-xl font-normal">
            Understand role alignment with clarity and{" "}
            <span className="italic font-serif">zero guesswork</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-lg font-sans">
            Compare your resume with any job description, identify critical requirements, and inspect transparent compatibility scoring without external AI hallucination.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#analyzer"
              className="px-6 py-3 text-xs sm:text-sm font-medium rounded-full bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#121312] dark:hover:bg-white text-white transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center"
            >
              <span>Analyze your resume</span>
            </a>

            <a
              href="#how-it-works"
              className="px-5 py-3 text-xs sm:text-sm font-medium rounded-full text-[#141514] dark:text-[#F4F2EE] hover:text-[#5C5E58] dark:hover:text-[#9E9F97] transition-colors cursor-pointer"
            >
              How it works
            </a>
          </div>

          <p className="mt-7 text-xs text-[#82847E] dark:text-[#72736C] font-mono">
            Free to use &bull; No account required &bull; 100% in-memory evaluation
          </p>
        </div>

        {/* Right Column: Floating Lightweight Analytical Surface */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white/95 dark:bg-[#1B1C1A]/95 backdrop-blur-md border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/[0.03] transition-all hover:shadow-2xl hover:shadow-black/[0.05]">
            {/* Header: Role and Circular Radial Score Indicator */}
            <div className="flex items-center justify-between pb-5 border-b border-[#EAE4DC] dark:border-[#2F302C]">
              <div>
                <span className="text-sm sm:text-base font-medium text-[#141514] dark:text-[#F4F2EE] block">
                  Senior Full-Stack Engineer
                </span>
                <span className="text-xs text-[#5C5E58] dark:text-[#9E9F97] block mt-0.5">
                  Engineering &bull; Cloud Systems
                </span>
              </div>

              {/* Luminous Circular Donut Gauge (matching Steep reference style) */}
              <div className="relative flex flex-col items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[#EAE4DC] dark:text-[#2F302C]"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Arc: 84% */}
                  <path
                    className="text-[#1B663E] dark:text-[#35A36A]"
                    stroke="currentColor"
                    strokeDasharray="84, 100"
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-[#141514] dark:text-[#F4F2EE] leading-none">
                    84%
                  </span>
                </div>
              </div>
            </div>

            {/* Concise Skill Coverage Metric */}
            <div className="py-4 border-b border-[#EAE4DC] dark:border-[#2F302C]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#5C5E58] dark:text-[#9E9F97]">Skill Coverage</span>
                <span className="font-medium text-[#141514] dark:text-[#F4F2EE]">
                  7 of 8 core requirements
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] dark:bg-[#222320] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#141514] dark:bg-[#F4F2EE] h-1.5 rounded-full" style={{ width: "87.5%" }} />
              </div>
            </div>

            {/* 3 Quiet Requirement Statuses */}
            <div className="pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B663E] dark:bg-[#35A36A]" />
                  <span className="text-[#141514] dark:text-[#F4F2EE] font-medium">TypeScript &bull; Next.js</span>
                </div>
                <span className="text-[11px] font-mono text-[#1B663E] dark:text-[#35A36A] font-medium">
                  Matched
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B663E] dark:bg-[#35A36A]" />
                  <span className="text-[#141514] dark:text-[#F4F2EE] font-medium">PostgreSQL &bull; Redis</span>
                </div>
                <span className="text-[11px] font-mono text-[#1B663E] dark:text-[#35A36A] font-medium">
                  Matched
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B83232] dark:bg-[#E55353]" />
                  <span className="text-[#141514] dark:text-[#F4F2EE] font-medium">Kubernetes (k8s)</span>
                </div>
                <span className="text-[11px] font-mono text-[#B83232] dark:text-[#E55353] font-medium">
                  Missing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
