"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import AnalysisResult from "@/components/AnalysisResult";
import ProjectUses from "@/components/ProjectUses";
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

  const charCount = jobDescription.length;
  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between text-[var(--text-main)] font-sans antialiased selection:bg-blue-100">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/20 tracking-tight">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                MatchEngine
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
                Resume vs. JD AI
              </span>
            </div>
          </div>

          {analysisResult && (
            <button
              type="button"
              onClick={handleCompareAgain}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              &larr; Back to Editor
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col justify-between">
        <div>
          {/* Hero Header */}
          <div className="text-center mb-8 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-3.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Smart Resume Matcher</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug">
              Compare Resume Against Job Requirements
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload candidate resume PDF/DOCX and paste target job requirements to generate a detailed compatibility report.
            </p>
          </div>

          {/* Conditional View: Input Grid vs Results View */}
          {analysisResult ? (
            <AnalysisResult data={analysisResult} onCompareAgain={handleCompareAgain} />
          ) : (
            <>
              {/* Two Column Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-8">
                {/* Left Column: Resume Upload */}
                <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <label className="text-sm font-bold text-slate-900 tracking-tight">
                        Candidate Resume
                      </label>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">.PDF / .DOCX</span>
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
                      className={`group flex-1 min-h-[250px] md:min-h-[290px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? "border-blue-600 bg-blue-50/70 scale-[1.01] shadow-inner"
                          : "border-slate-300/90 hover:border-blue-500 hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3.5 group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                        <svg
                          className="w-7 h-7 stroke-blue-600"
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
                      <p className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        Drag and drop your resume file
                      </p>
                      <p className="text-xs text-slate-500 mb-3">
                        or <span className="text-blue-600 font-semibold underline underline-offset-2">browse computer</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-full font-medium">
                        <span>Max file size: 5MB</span>
                      </div>
                    </div>
                  ) : (
                    /* Selected File Preview Card */
                    <div className="flex-1 min-h-[250px] md:min-h-[290px] bg-slate-50/80 border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[190px] md:max-w-[210px]" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Ready for analysis
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                        >
                          Replace file
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Job Description Textarea */}
                <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      <label className="text-sm font-bold text-slate-900 tracking-tight">
                        Job Description
                      </label>
                    </div>
                    {jobDescription ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {wordCount} words &bull; {charCount} chars
                        </span>
                        <button
                          type="button"
                          onClick={() => setJobDescription("")}
                          className="text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Text or Requirements</span>
                    )}
                  </div>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description, required skills, and key responsibilities here..."
                    className="flex-1 w-full min-h-[250px] md:min-h-[290px] p-4 text-sm text-slate-800 bg-slate-50/60 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none leading-relaxed transition-all placeholder:text-slate-400 font-sans"
                  />
                </div>
              </div>

              {/* Action Area */}
              <div className="w-full flex flex-col items-center justify-center mt-2 mb-4">
                <button
                  type="button"
                  onClick={handleCompareClick}
                  disabled={isAnalyzing}
                  className="w-full md:w-80 h-12 rounded-xl text-white font-semibold text-sm tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Analyzing Compatibility...</span>
                    </>
                  ) : (
                    <>
                      <span>Compare & Match</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>

                {errorMsg && (
                  <div className="mt-3 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-fade-in">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {errorMsg}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Project Uses & Purpose Section */}
          <ProjectUses />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-900 text-slate-400 py-5 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-300">MatchEngine &copy; {new Date().getFullYear()}</span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-400">Resume vs. JD Matcher</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Crafted by</span>
            <a
              href="https://pratham-portfolio-sooty.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Pratham Verma
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

