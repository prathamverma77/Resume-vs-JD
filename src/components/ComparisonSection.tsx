"use client";

import React from "react";
import ResumeUpload from "./ResumeUpload";
import JobDescriptionInput from "./JobDescriptionInput";
import CompareAction from "./CompareAction";

interface ComparisonSectionProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  isAnalyzing: boolean;
  onCompare: () => void;
  errorMsg: string | null;
  onError?: (error: string | null) => void;
}

export default function ComparisonSection({
  file,
  onFileChange,
  jobDescription,
  onJobDescriptionChange,
  isAnalyzing,
  onCompare,
  errorMsg,
  onError,
}: ComparisonSectionProps) {
  return (
    <section id="analyzer" className="w-full scroll-mt-24">
      {/* Section Header: Centered Editorial Header */}
      <div className="mb-8 md:mb-10 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#141514] dark:text-[#F4F2EE] tracking-[-0.02em] font-normal leading-tight">
          Analyze a resume against a job
        </h2>
        <p className="text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] mt-2.5 leading-relaxed font-sans">
          Upload a candidate resume PDF and provide the target job requirements to generate an alignment report.
        </p>
      </div>

      {/* Two-Column Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-6 md:mb-8">
        <ResumeUpload
          file={file}
          onFileChange={onFileChange}
          onError={onError}
        />
        <JobDescriptionInput
          value={jobDescription}
          onChange={onJobDescriptionChange}
        />
      </div>

      {/* Analysis Action */}
      <CompareAction
        isAnalyzing={isAnalyzing}
        onCompare={onCompare}
        errorMsg={errorMsg}
      />
    </section>
  );
}
