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
    <div className="min-h-screen flex flex-col justify-between text-[var(--text-main)] font-sans antialiased transition-colors">
      <Navbar showBack={true} onBack={handleCompareAgain} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-7 md:py-9 flex flex-col">
        {analysisResult ? (
          <div className="w-full">
            <div className="mb-8 text-center max-w-xl mx-auto">
              <span className="inline-block text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                Audit Report
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Compatibility Analysis
              </h1>
              <p className="text-sm md:text-base font-normal text-zinc-600 dark:text-zinc-300 mt-1.5">
                Detailed comparison breakdown, keyword alignment, and gap analysis.
              </p>
            </div>

            <AnalysisResult
              data={analysisResult}
              onCompareAgain={handleCompareAgain}
            />
          </div>
        ) : (
          /* Empty State for Direct Navigation / Refresh */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 mb-4 shadow-2xs">
              <svg
                className="w-7 h-7"
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
            <h2 className="text-lg md:text-xl font-bold text-zinc-950 dark:text-white mb-2">
              No active analysis found
            </h2>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
              Data is processed strictly in-memory and not stored in a persistent database. Please upload your files to run an analysis.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer shadow-xs shadow-blue-500/20"
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
              <span>Back to matcher</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
