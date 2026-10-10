import React from "react";

export default function HeroSection() {
  return (
    <div className="text-center mb-8 max-w-4xl mx-auto animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-3.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Smart Resume Matcher</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug">
        Compare Resume Against Job Requirements
      </h1>
      <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Upload candidate resume PDF and paste target job requirements to generate a detailed compatibility report.
      </p>
    </div>
  );
}
