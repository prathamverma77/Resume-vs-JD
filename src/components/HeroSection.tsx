import React from "react";

export default function HeroSection() {
  return (
    <section className="text-center mb-8 max-w-3xl mx-auto animate-fade-in pt-2">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-3.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Smart Resume Matcher</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug">
        Compare Resume Against Job Requirements
      </h1>
      <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-3">
        Upload candidate resume PDF and paste target job requirements to generate a detailed compatibility report.
      </p>
      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/70 border border-slate-200/60 px-3 py-1 rounded-full">
        <span>Free to use</span>
        <span className="text-slate-300">&bull;</span>
        <span>No account required</span>
        <span className="text-slate-300">&bull;</span>
        <span>Private in-memory processing</span>
      </div>
    </section>
  );
}
