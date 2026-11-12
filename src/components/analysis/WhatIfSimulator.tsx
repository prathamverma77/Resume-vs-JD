"use client";

import React from "react";
import { MissingSkillImpact } from "./types";

interface WhatIfSimulatorProps {
  isSimulating: boolean;
  simulatedSkills: string[];
  score: number;
  baselineScore: number;
  scoreDelta: number;
  missingSkillsWithImpact: MissingSkillImpact[];
  onToggleSkill: (skill: string) => void;
  onReset: () => void;
  onSimulateAll: () => void;
  onSimulateTopThree: () => void;
}

export default function WhatIfSimulator({
  isSimulating,
  simulatedSkills,
  score,
  baselineScore,
  scoreDelta,
  missingSkillsWithImpact,
  onToggleSkill,
  onReset,
  onSimulateAll,
  onSimulateTopThree,
}: WhatIfSimulatorProps) {
  return (
    <div className={`p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-gradient-to-b from-white via-[#FAF7F2]/50 to-white dark:from-[#181917] dark:via-[#161715] dark:to-[#181917] transition-all print:bg-white print:p-4 print-avoid-break ${isSimulating ? "" : "print:hidden"}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C] print:mb-3 print:pb-3">
        <div>
          <div className="flex items-center gap-2 mb-2 print:mb-1">
            <span className="relative flex h-2.5 w-2.5 print:hidden">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
              Deterministic Recalculation Engine (&lt;1ms)
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl print:text-xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em] flex items-center gap-2.5">
            <span>Live &ldquo;What-If&rdquo; Skill Simulator</span>
            {isSimulating && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                Active
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Click missing qualifications below to dynamically simulate score lift and see the exact marginal ROI of acquiring each skill.
          </p>
        </div>

        {/* Simulator Control Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
          {isSimulating ? (
            <>
              <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-2 shadow-2xs">
                <span>{simulatedSkills.length} Simulated</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ▲ +{scoreDelta}% Lift
                </span>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#222320] text-[#141514] dark:text-[#F4F2EE] hover:bg-[#FAF7F2] dark:hover:bg-[#2A2B27] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5 text-[#82847E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Reset Simulation</span>
              </button>
            </>
          ) : (
            missingSkillsWithImpact.length >= 3 && (
              <button
                type="button"
                onClick={onSimulateTopThree}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span>Simulate Top 3 ROI Skills</span>
              </button>
            )
          )}

          {missingSkillsWithImpact.length > 0 && simulatedSkills.length < missingSkillsWithImpact.length && (
            <button
              type="button"
              onClick={onSimulateAll}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] dark:bg-[#1E1F1D] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Simulate All Gaps ({missingSkillsWithImpact.length})
            </button>
          )}
        </div>
      </div>

      {/* Missing Skills Interactive Grid */}
      {missingSkillsWithImpact.length === 0 ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="block font-semibold text-sm mb-1">
            🌟 Flawless Technical Match
          </span>
          <span>
            All technical requirements and preferred bonus qualifications are already verified in the candidate profile. No missing skills to simulate!
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Print-only active simulation projection banner */}
          {isSimulating && (
            <div className="hidden print:flex items-center justify-between p-4 rounded-xl border border-cyan-500/40 bg-cyan-50 text-xs mb-3">
              <div>
                <span className="font-semibold text-cyan-950 block">
                  Modeled What-If Skills Projection Active:
                </span>
                <span className="text-cyan-800 font-mono mt-0.5 block">
                  {simulatedSkills.join(", ")}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[11px] text-cyan-700 block">Projected Score: {score}%</span>
                <span className="font-bold text-emerald-700 block">▲ +{scoreDelta}% Lift</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#5C5E58] dark:text-[#9E9F97] print:hidden">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Missing Target Skills (Ranked by Score Lift)
            </span>
            <span className="text-[11px] font-mono">
              Click any chip to toggle simulation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 print:hidden">
            {missingSkillsWithImpact.map((item) => {
              const isSelected = simulatedSkills.includes(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onToggleSkill(item.name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-br from-cyan-500/15 via-emerald-500/10 to-cyan-500/15 border-cyan-500 dark:border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50"
                      : "bg-white dark:bg-[#1E1F1D] border-[#EAE4DC] dark:border-[#2F302C] hover:border-cyan-500/50 hover:bg-[#FAF7F2]/60 dark:hover:bg-[#252623] shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs sm:text-sm text-[#141514] dark:text-[#F4F2EE] group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#82847E] dark:text-[#72736C] mt-0.5">
                        {item.weightTier}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        item.category === "Required"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.category === "Required" ? "Req" : "Pref"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DC]/60 dark:border-[#2F302C]/60 text-xs">
                    {/* Score Lift Pill */}
                    <div className="flex items-center gap-1 font-mono">
                      <span
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? "text-cyan-700 dark:text-cyan-300"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        +{item.boost}%
                      </span>
                      <span className="text-[10px] text-[#82847E] dark:text-[#72736C]">
                        lift
                      </span>
                    </div>

                    {/* State Indicator */}
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-cyan-500 text-white shadow-2xs"
                          : "bg-[#FAF7F2] dark:bg-[#141514] text-[#82847E] dark:text-[#72736C] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 border border-[#EAE4DC] dark:border-[#2F302C]"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span>Simulated</span>
                        </>
                      ) : (
                        <>
                          <span>+</span>
                          <span>Add</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Simulator Guidance Footer */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] flex items-start gap-3 text-xs print:hidden">
            <span className="text-base leading-none">💡</span>
            <div className="space-y-1">
              <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] block">
                {isSimulating
                  ? `Dynamic Simulation Active (${simulatedSkills.length} skill${simulatedSkills.length > 1 ? "s" : ""} added)`
                  : "Simulator Insights & ROI Prioritization"}
              </span>
              <p className="text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
                {isSimulating ? (
                  <>
                    With simulated skills (<span className="font-mono text-cyan-700 dark:text-cyan-400">{simulatedSkills.join(", ")}</span>), your overall match score shifts from{" "}
                    <span className="font-mono font-semibold">{baselineScore}%</span> to{" "}
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{score}%</span> (▲ +{scoreDelta}%). Remember to substantiate these skills on your resume with concrete business outcomes and architecture bullets.
                  </>
                ) : (
                  <>
                    Skills are weighted using 3-tier taxonomy (Tier 1 Core Languages &amp; Cloud Platforms = 3.0x, Tier 2 Frameworks = 2.0x, Tier 3 Tools = 1.0x).
                    {missingSkillsWithImpact[0] && (
                      <span>
                        {" "}Prioritizing <strong className="text-[#141514] dark:text-[#F4F2EE] font-mono">{missingSkillsWithImpact[0].name}</strong> yields the greatest individual return (<strong className="text-emerald-700 dark:text-emerald-400">+{missingSkillsWithImpact[0].boost}% boost</strong>).
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

