"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  HeroSection,
  ComparisonSection,
  HowItWorks,
  Features,
  PrivacySection,
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
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FFFDF9] dark:bg-[#121312] text-[#141514] dark:text-[#F4F2EE] font-sans antialiased overflow-x-hidden transition-colors">
      {/* Luminous Warm Pastel Aura (Peach & Blush Glow) */}
      <div className="luminous-glow" aria-hidden="true" />

      {/* Section 1: Navbar */}
      <Navbar />

      {/* Main Content Container with Balanced Editorial Spacing */}
      <main className="relative z-10 flex-1 max-w-[1060px] w-full mx-auto px-6 sm:px-8 md:px-10 py-8 md:py-12 flex flex-col">
        <div className="w-full space-y-16 md:space-y-20">
          {/* Section 2: Hero */}
          <HeroSection />

          {/* Section 3: Resume Analysis Form */}
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

          {/* Section 5: Capabilities */}
          <Features />

          {/* Section 6: In-Memory Privacy Assurance */}
          <PrivacySection />

          {/* Section 7: FAQ */}
          <FAQ />
        </div>
      </main>

      {/* Section 8: Footer */}
      <Footer />
    </div>
  );
}
