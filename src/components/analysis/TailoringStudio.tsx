// src/components/analysis/TailoringStudio.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  TailoringRequest,
  TailoringResponse,
  TailoredBullet,
  TailoringIntensity,
} from "@/types/tailoring";
import { AdjacentSkillMatch } from "@/types/analysis";

interface TailoringStudioProps {
  resumeText: string;
  targetRole?: string;
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  adjacentMatches?: AdjacentSkillMatch[];
  responsibilities?: string[];
  baselineScore: number;
}

export default function TailoringStudio({
  resumeText,
  targetRole,
  missingRequiredSkills,
  missingPreferredSkills,
  adjacentMatches,
  responsibilities,
  baselineScore,
}: TailoringStudioProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TailoringResponse | null>(null);
  const [intensity, setIntensity] = useState<TailoringIntensity>("balanced");
  const [copied, setCopied] = useState(false);
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [editDraftText, setEditDraftText] = useState("");

  const allMissingSkills = useMemo(() => {
    return Array.from(new Set([...missingRequiredSkills, ...missingPreferredSkills]));
  }, [missingRequiredSkills, missingPreferredSkills]);

  // Execute Tailoring API Call
  const handleGenerateTailoring = async (chosenIntensity = intensity) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: TailoringRequest = {
        resumeText,
        targetRole: targetRole || "Target Position",
        missingSkills: allMissingSkills,
        adjacentMatches: adjacentMatches?.map((m) => ({
          requiredSkill: m.requiredSkill,
          candidateSkill: m.matchedCandidateSkill,
          family: m.family,
        })),
        targetResponsibilities: responsibilities,
        intensity: chosenIntensity,
      };

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed with status ${res.status}`);
      }

      const result: TailoringResponse = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to generate tailored resume.");
      }

      setData(result);
    } catch (err) {
      console.error("[TailoringStudio] Generation failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during tailoring.");
    } finally {
      setIsLoading(false);
    }
  };

  // Status mutation handlers
  const handleUpdateBulletStatus = (
    bulletId: string,
    status: TailoredBullet["status"],
    customText?: string
  ) => {
    if (!data) return;

    setData({
      ...data,
      sections: data.sections.map((sec) => ({
        ...sec,
        bullets: sec.bullets.map((b) => {
          if (b.id !== bulletId) return b;
          return {
            ...b,
            status,
            ...(customText !== undefined ? { userEditedText: customText } : {}),
          };
        }),
      })),
    });
  };

  const handleAcceptAll = () => {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map((sec) => ({
        ...sec,
        bullets: sec.bullets.map((b) => ({
          ...b,
          status: "accepted",
        })),
      })),
    });
  };

  const handleResetAll = () => {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map((sec) => ({
        ...sec,
        bullets: sec.bullets.map((b) => ({
          ...b,
          status: "pending",
          userEditedText: undefined,
        })),
      })),
    });
  };

  // Progress metrics
  const progress = useMemo(() => {
    if (!data) {
      return { total: 0, accepted: 0, rejected: 0, pending: 0, lift: 0, currentScore: baselineScore };
    }

    const allBullets = data.sections.flatMap((s) => s.bullets);
    const total = allBullets.length;
    const accepted = allBullets.filter((b) => b.status === "accepted" || b.status === "custom_edited").length;
    const rejected = allBullets.filter((b) => b.status === "rejected").length;
    const pending = allBullets.filter((b) => b.status === "pending").length;

    const maxLift = Math.max(0, data.projectedScore - data.baselineScore);
    const currentLift = total > 0 ? Math.round((accepted / total) * maxLift) : 0;
    const currentScore = Math.min(100, data.baselineScore + currentLift);

    return { total, accepted, rejected, pending, lift: currentLift, currentScore };
  }, [data, baselineScore]);

  // Copy full tailored resume to clipboard
  const handleCopyTailoredText = async () => {
    if (!data) return;

    const lines: string[] = [];
    lines.push(`=======================================================`);
    lines.push(`TAILORED RESUME - OPTIMIZED FOR ${targetRole ? targetRole.toUpperCase() : "TARGET ROLE"}`);
    lines.push(`Projected ATS Score: ${progress.currentScore}% (▲ +${progress.lift}% Lift)`);
    lines.push(`=======================================================\n`);

    for (const sec of data.sections) {
      lines.push(`${sec.heading.toUpperCase()}${sec.subheading ? ` - ${sec.subheading}` : ""}${sec.dateSpan ? ` (${sec.dateSpan})` : ""}`);
      lines.push(`-------------------------------------------------------`);
      for (const b of sec.bullets) {
        if (b.status === "rejected") {
          lines.push(`• ${b.originalText}`);
        } else if (b.status === "custom_edited" && b.userEditedText) {
          lines.push(`• ${b.userEditedText}`);
        } else {
          lines.push(`• ${b.tailoredText}`);
        }
      }
      lines.push("");
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Helper to highlight keywords in text
  const renderHighlightedText = (text: string, keywords: string[], metrics: string[]) => {
    if (!keywords.length && !metrics.length) return <span>{text}</span>;

    // Create token map for safe highlight rendering
    return (
      <span className="leading-relaxed">
        {text}
        <span className="mt-2 flex flex-wrap items-center gap-1.5 block">
          {keywords.map((kw, i) => (
            <span
              key={`kw-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              +{kw}
            </span>
          ))}
          {metrics.map((met, i) => (
            <span
              key={`met-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20"
            >
              ✓ Preserved: {met}
            </span>
          ))}
        </span>
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-gradient-to-b from-white via-[#FAF7F2]/40 to-white dark:from-[#181917] dark:via-[#161715] dark:to-[#181917] transition-all print:hidden">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              AI Tailoring &amp; Keyword Alignment Studio
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em] flex items-center gap-2.5">
            <span>Dynamic ATS Resume Tailoring</span>
            {data && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                Ready
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Truthfully reframe your experience with missing target keywords, active verbs, and preserved metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Intensity Selector */}
          <div className="flex items-center rounded-full bg-[#FAF7F2] dark:bg-[#1E1F1D] p-0.5 border border-[#EAE4DC] dark:border-[#2F302C] text-xs font-medium">
            {(["conservative", "balanced", "aggressive"] as TailoringIntensity[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setIntensity(mode);
                  if (data) handleGenerateTailoring(mode);
                }}
                disabled={isLoading}
                title={`Tailoring Mode: ${mode}`}
                className={`px-2.5 py-1 rounded-full text-[11px] capitalize transition-all cursor-pointer ${
                  intensity === mode
                    ? "bg-white dark:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] font-semibold shadow-xs"
                    : "text-[#82847E] hover:text-[#141514] dark:hover:text-[#F4F2EE]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {!data && !isLoading && (
            <button
              type="button"
              onClick={() => handleGenerateTailoring()}
              className="px-5 py-2.5 text-xs font-semibold rounded-full bg-[#141514] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#141514] dark:hover:bg-white text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span>✨ Tailor Resume Now</span>
            </button>
          )}

          {data && (
            <>
              <button
                type="button"
                onClick={handleCopyTailoredText}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#222320] text-[#141514] dark:text-[#F4F2EE] hover:bg-[#FAF7F2] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#82847E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>Copy Tailored Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleGenerateTailoring()}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] dark:bg-[#1E1F1D] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] transition-all cursor-pointer shadow-2xs"
              >
                Re-generate
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="py-12 px-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] text-center flex flex-col items-center justify-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#141514] dark:text-[#F4F2EE]">
              Executing Semantic Reframing &amp; Keyword Alignment
            </h3>
            <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] mt-1 max-w-md mx-auto">
              Scanning candidate bullets, bridging target skills ({allMissingSkills.slice(0, 4).join(", ") || "keywords"}), and verifying metric invariance...
            </p>
          </div>
        </div>
      )}

      {/* 3. Error Alert */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateTailoring()}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-all text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Active Studio: Diff Viewer */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* Progress & Live Score Lift Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                <span className="font-bold text-base text-emerald-700 dark:text-emerald-400 leading-none">
                  {progress.currentScore}%
                </span>
                <span className="text-[9px] font-mono text-[#82847E] dark:text-[#72736C] uppercase">
                  ATS Fit
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#141514] dark:text-[#F4F2EE]">
                    Live Projected Score: {progress.currentScore}%
                  </span>
                  {progress.lift > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                      ▲ +{progress.lift}% Lift
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] block mt-0.5">
                  {progress.accepted} of {progress.total} bullet refinements accepted ({data.engineUsed})
                </span>
              </div>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs cursor-pointer"
              >
                ✓ Accept All ({progress.total})
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-1.5 rounded-xl font-medium border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] dark:bg-[#222320] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Sectional Before / After Breakdown */}
          {data.sections.map((section) => (
            <div
              key={section.sectionId}
              className="rounded-2xl border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#1B1C1A] overflow-hidden shadow-2xs"
            >
              {/* Section Header */}
              <div className="p-4 sm:p-5 bg-[#FAF7F2]/60 dark:bg-[#161715] border-b border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block">
                    {section.title}
                  </span>
                  <h3 className="font-semibold text-sm sm:text-base text-[#141514] dark:text-[#F4F2EE]">
                    {section.heading}
                    {section.subheading && <span className="font-normal text-[#5C5E58] dark:text-[#9E9F97]"> &bull; {section.subheading}</span>}
                  </h3>
                </div>
                {section.dateSpan && (
                  <span className="text-xs font-mono text-[#5C5E58] dark:text-[#9E9F97] px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C]">
                    {section.dateSpan}
                  </span>
                )}
              </div>

              {/* Bullet Diff Cards */}
              <div className="divide-y divide-[#EAE4DC]/80 dark:divide-[#2F302C]/80">
                {section.bullets.map((bullet) => {
                  const isAccepted = bullet.status === "accepted" || bullet.status === "custom_edited";
                  const isRejected = bullet.status === "rejected";
                  const isEditing = editingBulletId === bullet.id;

                  return (
                    <div
                      key={bullet.id}
                      className={`p-4 sm:p-6 transition-colors ${
                        isAccepted
                          ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]"
                          : isRejected
                          ? "bg-neutral-500/[0.02] dark:bg-neutral-500/[0.03] opacity-60"
                          : "hover:bg-[#FAF7F2]/40 dark:hover:bg-[#1F201D]"
                      }`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Left Column: Original Bullet (5 Cols) */}
                        <div className="lg:col-span-5 text-xs text-[#5C5E58] dark:text-[#9E9F97] space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block font-semibold">
                            Original Bullet
                          </span>
                          <p className="leading-relaxed font-sans">{bullet.originalText}</p>
                        </div>

                        {/* Right Column: Tailored Refinement (7 Cols) */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ATS Refined Proposal
                            </span>

                            {/* Badge Status */}
                            {isAccepted && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                {bullet.status === "custom_edited" ? "Customized" : "Accepted"}
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                                Kept Original
                              </span>
                            )}
                          </div>

                          {/* Refined Text or Edit Box */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editDraftText}
                                onChange={(e) => setEditDraftText(e.target.value)}
                                rows={3}
                                className="w-full text-xs p-3 rounded-xl border border-emerald-500 bg-white dark:bg-[#181917] text-[#141514] dark:text-[#F4F2EE] focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateBulletStatus(bullet.id, "custom_edited", editDraftText);
                                    setEditingBulletId(null);
                                  }}
                                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white"
                                >
                                  Save Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingBulletId(null)}
                                  className="px-3 py-1 rounded-lg text-xs font-medium border border-[#EAE4DC] text-[#5C5E58]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs sm:text-[13px] text-[#141514] dark:text-[#F4F2EE] font-sans">
                              {renderHighlightedText(
                                bullet.userEditedText || bullet.tailoredText,
                                bullet.injectedKeywords,
                                bullet.preservedMetrics
                              )}
                            </div>
                          )}

                          {/* Rationale Note */}
                          <div className="text-[11px] text-[#82847E] dark:text-[#72736C] font-sans italic bg-[#FAF7F2]/80 dark:bg-[#161715] p-2.5 rounded-xl border border-[#EAE4DC]/60 dark:border-[#2F302C]/60">
                            <strong>Rationale:</strong> {bullet.rationale}
                          </div>

                          {/* Granular Action Controls */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {!isAccepted ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateBulletStatus(bullet.id, "accepted")}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <span>✓ Accept</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateBulletStatus(bullet.id, "pending")}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#EAE4DC] text-[#82847E] hover:text-[#141514] transition-all cursor-pointer"
                              >
                                Undo
                              </button>
                            )}

                            {!isRejected ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateBulletStatus(bullet.id, "rejected")}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-rose-600 transition-all cursor-pointer"
                              >
                                Keep Original
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateBulletStatus(bullet.id, "pending")}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#EAE4DC] text-[#82847E] hover:text-[#141514] transition-all cursor-pointer"
                              >
                                Restore Proposal
                              </button>
                            )}

                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBulletId(bullet.id);
                                  setEditDraftText(bullet.userEditedText || bullet.tailoredText);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#82847E] hover:text-[#141514] transition-all cursor-pointer"
                              >
                                ✏️ Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
