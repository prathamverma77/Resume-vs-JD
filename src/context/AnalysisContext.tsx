"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnalyzeApiResponse } from "@/types/analysis";

interface AnalysisContextType {
  analysisResult: AnalyzeApiResponse | null;
  setAnalysisResult: (result: AnalyzeApiResponse | null) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysisResult, setAnalysisResultState] = useState<AnalyzeApiResponse | null>(null);

  // Hydrate from sessionStorage on page reload to prevent losing active report
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("matchengine_analysis");
      if (saved) {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => {
          setAnalysisResultState(parsed);
        });
      }
    } catch {
      // Safe fallback if storage unavailable
    }
  }, []);

  const setAnalysisResult = (result: AnalyzeApiResponse | null) => {
    setAnalysisResultState(result);
    try {
      if (result) {
        sessionStorage.setItem("matchengine_analysis", JSON.stringify(result));
      } else {
        sessionStorage.removeItem("matchengine_analysis");
      }
    } catch {
      // Safe fallback if storage quota exceeded
    }
  };

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
