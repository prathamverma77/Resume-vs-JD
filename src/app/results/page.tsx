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
    <div className="min-h-screen flex flex-col justify-between text-[var(--text-main)] font-sans antialiased selection:bg-blue-100">
      <Navbar showBack={true} onBack={handleCompareAgain} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col justify-between">
        {analysisResult ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                  Active Analysis
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  Resume Compatibility Results
                </h1>
              </div>
            </div>

            <AnalysisResult
              data={analysisResult}
              onCompareAgain={handleCompareAgain}
            />
          </div>
        ) : (
          /* Empty State for Direct Navigation / Refresh */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-5 shadow-2xs">
              <svg
                className="w-8 h-8"
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
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Active Analysis Found
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6">
              MatchEngine processes candidate resumes strictly in-memory without persistent database storage. If you refreshed the page or arrived here directly, please upload your resume and job description to generate a report.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <span>Back to Resume Matcher</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
