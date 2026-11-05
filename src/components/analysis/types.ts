export type RequirementFilter =
  | "all"
  | "matched"
  | "missing_required"
  | "missing_preferred"
  | "simulated";

export interface RequirementItem {
  id: string;
  name: string;
  category: "Required" | "Preferred";
  status: "Matched" | "Adjacent Match" | "Not found in resume" | "Simulated Match";
  isMatched: boolean;
  isAdjacent?: boolean;
  isSimulated?: boolean;
  evidence: string;
  evidenceQuote?: string;
  isProductionDepth?: boolean;
  weightTier: string;
}

export interface MissingSkillImpact {
  name: string;
  category: "Required" | "Preferred";
  boost: number;
  weight: number;
  weightTier: string;
}

export interface ScoreTheme {
  stroke: string;
  strokeGradStart: string;
  strokeGradEnd: string;
  textColor: string;
  bgLight: string;
  badgeBorder: string;
  badgeText: string;
}

export function getScoreTheme(val: number): ScoreTheme {
  if (val >= 75) {
    return {
      stroke: "#10B981",
      strokeGradStart: "#10B981",
      strokeGradEnd: "#059669",
      textColor: "text-emerald-700 dark:text-emerald-400",
      bgLight: "bg-emerald-500/10 dark:bg-emerald-500/15",
      badgeBorder: "border-emerald-500/30",
      badgeText: "text-emerald-800 dark:text-emerald-300",
    };
  }
  if (val >= 50) {
    return {
      stroke: "#3B82F6",
      strokeGradStart: "#3B82F6",
      strokeGradEnd: "#1D4ED8",
      textColor: "text-blue-700 dark:text-blue-400",
      bgLight: "bg-blue-500/10 dark:bg-blue-500/15",
      badgeBorder: "border-blue-500/30",
      badgeText: "text-blue-800 dark:text-blue-300",
    };
  }
  if (val >= 35) {
    return {
      stroke: "#F59E0B",
      strokeGradStart: "#F59E0B",
      strokeGradEnd: "#D97706",
      textColor: "text-amber-700 dark:text-amber-400",
      bgLight: "bg-amber-500/10 dark:bg-amber-500/15",
      badgeBorder: "border-amber-500/30",
      badgeText: "text-amber-800 dark:text-amber-300",
    };
  }
  return {
    stroke: "#EF4444",
    strokeGradStart: "#EF4444",
    strokeGradEnd: "#B91C1C",
    textColor: "text-rose-700 dark:text-rose-400",
    bgLight: "bg-rose-500/10 dark:bg-rose-500/15",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-800 dark:text-rose-300",
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

