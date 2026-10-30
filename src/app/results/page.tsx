"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AnalysisResult from "@/components/AnalysisResult";
import Footer from "@/components/Footer";
import { useAnalysis } from "@/context/AnalysisContext";

export default function ResultsPage() {
  const router = useRouter();
  const { analysisResult, clearAnalysis } = useAnalysis();

  const handleCompareAgain = () => {
    clearAnalysis();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FFFDF9] dark:bg-[#121312] text-[#141514] dark:text-[#F4F2EE] font-sans antialiased overflow-x-hidden transition-colors">
      {/* Balanced Atmospheric Aura for Results Dashboard */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-[#FFEBE4]/45 via-[#F3ECE4]/25 to-transparent dark:from-[#2A2B27]/40 dark:via-[#1B1C1A]/20 dark:to-transparent blur-3xl pointer-events-none -z-0" 
        aria-hidden="true" 
      />
      <Navbar showBack={true} onBack={handleCompareAgain} />

      <main className="relative z-10 flex-1 max-w-[1140px] w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col">
        {analysisResult ? (
          <div className="w-full">
            <AnalysisResult
              data={analysisResult}
              onCompareAgain={handleCompareAgain}
            />
          </div>
        ) : (
          /* Empty State for Direct Navigation / Refresh */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-center text-[#5C5E58] dark:text-[#9E9F97] mb-4 shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-normal text-[#141514] dark:text-[#F4F2EE] mb-2">
              No Active Analysis Found
            </h1>
            <p className="text-sm text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed mb-6 font-sans">
              MatchEngine processes document text strictly in-memory without persistent database storage. Please upload a resume and provide a target job description to run an analysis.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#121312] dark:hover:bg-white text-white text-xs font-semibold tracking-wide transition-all inline-flex items-center justify-center cursor-pointer shadow-xs"
            >
              <span>Return to Analyzer</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
