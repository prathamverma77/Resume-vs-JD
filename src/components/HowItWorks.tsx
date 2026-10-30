import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Upload a resume",
      desc: "Provide a selectable-text PDF. Text is extracted in-memory without persistent server storage.",
    },
    {
      num: "2",
      title: "Provide job requirements",
      desc: "Paste role responsibilities and qualifications. The parser identifies required and preferred skills.",
    },
    {
      num: "3",
      title: "Review the analysis",
      desc: "Inspect transparent keyword alignment, missing requirements, and prioritized improvement steps.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full scroll-mt-24 pb-8 md:pb-14">
      {/* Centered Editorial Header */}
      <div className="mb-10 md:mb-14 text-center max-w-2xl mx-auto">
        <span className="font-serif italic text-base sm:text-lg text-[#82847E] dark:text-[#72736C] block mb-2 select-none">
          Our Analysis Process
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#141514] dark:text-[#F4F2EE] tracking-[-0.02em] font-normal leading-tight">
          Here&apos;s how it works
        </h2>
        <p className="text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] mt-2.5 leading-relaxed font-sans">
          Deterministic alignment in three straightforward steps.
        </p>
      </div>

      {/* Rainbow Arch Cards: Compact Height & Tighter Proportions */}
      <div className="relative flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto gap-8 md:gap-2.5 lg:gap-1 px-4 sm:px-6 pt-4 pb-6">
        {/* Card 1: Left Wing of Rainbow (Tilted outward) */}
        <div className="relative z-10 w-full max-w-[310px] sm:max-w-[320px] md:w-[290px] lg:w-[320px] h-[260px] sm:h-[280px] md:h-[295px] bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transform md:origin-bottom-right md:-rotate-[8deg] md:translate-y-5 transition-all duration-300 ease-out hover:z-30 hover:rotate-0 hover:-translate-y-2 hover:shadow-2xl cursor-default">
          {/* Top Left: Clean Step Digit */}
          <div>
            <span className="text-5xl sm:text-6xl font-sans font-normal text-[#141514] dark:text-[#F4F2EE] leading-none select-none tracking-tight">
              {steps[0].num}
            </span>
          </div>

          {/* Bottom Left: Title & Description */}
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-medium text-[#141514] dark:text-[#F4F2EE] mb-1.5">
              {steps[0].title}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-[260px]">
              {steps[0].desc}
            </p>
          </div>
        </div>

        {/* Card 2: Center Apex of Rainbow (Elevated Summit) */}
        <div className="relative z-20 w-full max-w-[310px] sm:max-w-[320px] md:w-[290px] lg:w-[320px] h-[260px] sm:h-[280px] md:h-[295px] bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] transform md:origin-bottom md:rotate-0 md:-translate-y-4 transition-all duration-300 ease-out hover:z-30 hover:-translate-y-7 hover:shadow-2xl cursor-default">
          {/* Top Left: Clean Step Digit */}
          <div>
            <span className="text-5xl sm:text-6xl font-sans font-normal text-[#141514] dark:text-[#F4F2EE] leading-none select-none tracking-tight">
              {steps[1].num}
            </span>
          </div>

          {/* Bottom Left: Title & Description */}
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-medium text-[#141514] dark:text-[#F4F2EE] mb-1.5">
              {steps[1].title}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-[260px]">
              {steps[1].desc}
            </p>
          </div>
        </div>

        {/* Card 3: Right Wing of Rainbow (Tilted outward) */}
        <div className="relative z-10 w-full max-w-[310px] sm:max-w-[320px] md:w-[290px] lg:w-[320px] h-[260px] sm:h-[280px] md:h-[295px] bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transform md:origin-bottom-left md:rotate-[8deg] md:translate-y-5 transition-all duration-300 ease-out hover:z-30 hover:rotate-0 hover:-translate-y-2 hover:shadow-2xl cursor-default">
          {/* Top Left: Clean Step Digit */}
          <div>
            <span className="text-5xl sm:text-6xl font-sans font-normal text-[#141514] dark:text-[#F4F2EE] leading-none select-none tracking-tight">
              {steps[2].num}
            </span>
          </div>

          {/* Bottom Left: Title & Description */}
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-medium text-[#141514] dark:text-[#F4F2EE] mb-1.5">
              {steps[2].title}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-[260px]">
              {steps[2].desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
