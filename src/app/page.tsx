"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  HeroSection,
  ComparisonSection,
  HowItWorks,
  Features,
  FAQ,
  Footer,
} from "@/components";
import { useAnalysis } from "@/context/AnalysisContext";
import { AnalyzeApiResponse } from "@/types/analysis";

export default function Home() {
  const router = useRouter();
  const { setAnalysisResult } = useAnalysis();

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connect to POST /api/analyze
  const handleCompareClick = async () => {
    setErrorMsg(null);

    // 1. Client-side file validation
    if (!file) {
      setErrorMsg("Please upload a candidate resume PDF file to compare.");
      return;
    }

    if (file.size === 0) {
      setErrorMsg(
        "The selected resume file is empty (0 bytes). Please upload a valid PDF."
      );
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        "The uploaded resume file exceeds the 5MB size limit. Please choose a smaller file."
      );
      return;
    }

    // 2. Client-side JD validation
    const trimmedJD = jobDescription.trim();
    if (!trimmedJD) {
      setErrorMsg(
        "Please paste the job description to compare against the resume."
      );
      return;
    }

    if (trimmedJD.length < 30) {
      setErrorMsg(
        "The job description is too short (minimum 30 characters required for an accurate match)."
      );
      return;
    }

    const MAX_JD_LENGTH = 30000;
    if (trimmedJD.length > MAX_JD_LENGTH) {
      setErrorMsg(
        `The job description is unusually long (maximum ${MAX_JD_LENGTH.toLocaleString()} characters). Please trim unnecessary text.`
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", trimmedJD);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeApiResponse = await response.json();

      if (response.ok && data.success) {
        setAnalysisResult(data);
        router.push("/results");
      } else {
        setErrorMsg(data.message || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error("Comparison API error:", err);
      setErrorMsg(
        "An unexpected network or server error occurred while processing the request."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-[var(--text-main)] font-sans antialiased selection:bg-blue-100">
      {/* Section 1: Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col justify-between">
        <div>
          {/* Section 2: Hero */}
          <HeroSection />

          {/* Section 3: Resume Analysis Form (3 Logical Steps) */}
          <ComparisonSection
            file={file}
            onFileChange={setFile}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            isAnalyzing={isAnalyzing}
            onCompare={handleCompareClick}
            errorMsg={errorMsg}
            onError={setErrorMsg}
          />

          {/* Section 4: How It Works */}
          <HowItWorks />

          {/* Section 5: Features / What You'll Get */}
          <Features />

          {/* Section 6: Privacy and FAQ */}
          <FAQ />
        </div>
      </main>

      {/* Section 7: Footer */}
      <Footer />
    </div>
  );
}
