"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import AnalysisResult from "@/components/AnalysisResult";
import { AnalyzeApiResponse } from "@/types/analysis";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size formatter helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Drag and Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".pdf") ||
        droppedFile.name.endsWith(".docx")
      ) {
        setFile(droppedFile);
      } else {
        alert("Please upload a valid .pdf or .docx file.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Connect to POST /api/analyze
  const handleCompareClick = async () => {
    if (!file) {
      alert("Please upload a resume PDF file to compare.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeApiResponse = await response.json();

      if (response.ok && data.success) {
        setAnalysisResult(data);
      } else {
        setErrorMsg(data.message || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error("Comparison API error:", err);
      setErrorMsg("An unexpected error occurred while processing the request.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compare Again Reset Handler
  const handleCompareAgain = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-primary)] text-[var(--text-main)] font-sans antialiased selection:bg-sky-100">
      {/* Top Navbar */}
      <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
              M
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-main)]">
              MatchEngine
            </span>
          </div>

          {analysisResult && (
            <button
              type="button"
              onClick={handleCompareAgain}
              className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              &larr; Back to Input
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-between">
        <div>
          {/* Hero Header */}
          <div className="text-center mb-6 md:mb-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/70 text-[var(--primary)] text-xs font-medium mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Resume vs. JD Matcher
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-2">
              Compare Resume Against Job Requirements
            </h1>
            <p className="text-sm md:text-base text-[var(--text-muted)]">
              Upload candidate resume PDF and paste target job description to analyze compatibility.
            </p>
          </div>

          {/* Conditional View: Input Grid vs Results View */}
          {analysisResult ? (
            <AnalysisResult data={analysisResult} onCompareAgain={handleCompareAgain} />
          ) : (
            <>
              {/* Two Column Input Grid (Symmetrically Aligned) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch mb-6">
                {/* Left Column: Resume Upload */}
                <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-[var(--text-main)]">
                      Resume
                    </label>
                    <span className="text-xs text-[var(--text-muted)]">.pdf, .docx</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex-1 min-h-[240px] md:min-h-[280px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-[var(--primary)] bg-sky-50/60 scale-[1.005]"
                          : "border-slate-300 hover:border-[var(--primary)] hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[var(--text-muted)] mb-3 transition-transform group-hover:scale-105">
                        <svg
                          className="w-6 h-6 stroke-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.75"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-main)] mb-1">
                        Drag and drop your resume here
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        or <span className="text-[var(--primary)] font-medium underline underline-offset-2">browse files</span> from your computer
                      </p>
                      <span className="text-[11px] text-slate-400">PDF or DOCX up to 5MB</span>
                    </div>
                  ) : (
                    /* Selected File Preview Card */
                    <div className="flex-1 min-h-[240px] md:min-h-[280px] bg-slate-50/70 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-sky-100 text-[var(--primary)] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-[var(--text-main)] truncate max-w-[200px] md:max-w-[220px]" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-slate-400 hover:text-red-500 hover:bg-slate-200/60 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Ready for analysis
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[var(--primary)] hover:underline font-medium cursor-pointer"
                        >
                          Change file
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Job Description Textarea */}
                <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-[var(--text-main)]">
                      Job Description
                    </label>
                    {jobDescription && (
                      <button
                        type="button"
                        onClick={() => setJobDescription("")}
                        className="text-xs text-[var(--text-muted)] hover:text-slate-900 cursor-pointer"
                      >
                        Clear text
                      </button>
                    )}
                  </div>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description or requirements here..."
                    className="flex-1 w-full min-h-[240px] md:min-h-[280px] p-3.5 text-sm text-[var(--text-main)] bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* Action Area (Centered Below Grid) */}
              <div className="w-full flex flex-col items-center justify-center mt-2 mb-4">
                <button
                  type="button"
                  onClick={handleCompareClick}
                  disabled={isAnalyzing}
                  style={{ backgroundColor: "var(--primary)" }}
                  className="w-full md:w-80 h-12 rounded-lg text-white font-medium text-sm tracking-wide shadow-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Comparing...
                    </>
                  ) : (
                    <>
                      Compare Match
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>

                {errorMsg && (
                  <div className="mt-3 px-4 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs font-medium text-rose-700">
                    {errorMsg}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Small Clean Footer with Portfolio Link */}
      <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>MatchEngine &copy; {new Date().getFullYear()} &bull; Resume vs. JD Analyzer</span>
          <div>
            Made by{" "}
            <a
              href="https://pratham-portfolio-sooty.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Pratham Verma
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
