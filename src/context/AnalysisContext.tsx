"use client";

import React, { createContext, useContext, useState } from "react";
import { AnalyzeApiResponse } from "@/types/analysis";

interface AnalysisContextType {
  analysisResult: AnalyzeApiResponse | null;
  setAnalysisResult: (result: AnalyzeApiResponse | null) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeApiResponse | null>(null);

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        setAnalysisResult,
        clearAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextType {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
