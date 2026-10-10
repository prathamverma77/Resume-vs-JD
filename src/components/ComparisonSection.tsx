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
    <section id="analyzer" className="w-full scroll-mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-8">
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

      <CompareAction
        isAnalyzing={isAnalyzing}
        onCompare={onCompare}
        errorMsg={errorMsg}
      />
    </section>
  );
}
