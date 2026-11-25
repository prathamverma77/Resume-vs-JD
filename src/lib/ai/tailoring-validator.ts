// src/lib/ai/tailoring-validator.ts

/**
 * Regex patterns identifying quantitative metrics, percentages, currency, latencies, and scale quantifiers.
 */
const METRIC_PATTERNS = [
  // Percentages: 30%, 99.99%, 15.5%
  /\b\d+(?:\.\d+)?%/g,
  // Currency figures: $50k, $2.5M, $100,000, €500k, £10M
  /[$€£¥]\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[kmbKMB]?\b/g,
  // Scale multipliers: 10x, 3.5x
  /\b\d+(?:\.\d+)?x\b/gi,
  // Latency & performance: 200ms, 1.5s, 50μs, 100ns
  /\b\d+(?:\.\d+)?\s*(?:ms|μs|ns|seconds?|secs?)\b/gi,
  // Throughput & rate metrics: 500k rps, 10k qps, 50 req/s, 100 tps
  /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:[kmbKMB]\s*)?(?:rps|qps|req\/s|tps)\b/gi,
  // Volume & counts with multipliers: 500k, 10M, 2B
  /\b\d+(?:,\d{3})*(?:\.\d+)?\s*[kmbKMB]\b/g,
  // Distinct counts with common business units: 4 microservices, 12 engineers, 5 databases
  /\b\d+\s+(?:microservices?|services?|engineers?|developers?|users?|clients?|customers?|nodes?|clusters?|servers?|endpoints?|databases?|pipelines?|tables?|queries|records?)\b/gi,
];

/**
 * Normalizes a metric string for fuzzy comparison (e.g., "$ 50k" -> "$50k", "30 %" -> "30%").
 */
function normalizeMetric(metric: string): string {
  return metric.toLowerCase().replace(/\s+/g, "").trim();
}

/**
 * Extracts all quantifiable metrics, numbers, and scale units from text.
 */
export function extractMetrics(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  const found = new Set<string>();
  const normalizedSeen = new Set<string>();

  for (const pattern of METRIC_PATTERNS) {
    // Reset regex index for global matches
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        const norm = normalizeMetric(m);
        if (!normalizedSeen.has(norm) && m.trim().length > 0) {
          normalizedSeen.add(norm);
          found.add(m.trim());
        }
      }
    }
  }

  // Also catch any standalone numbers with 2 or more digits (e.g., "reduced latency by 45", "team of 15")
  const rawNumberRegex = /\b\d{2,}\b/g;
  const rawNumbers = text.match(rawNumberRegex);
  if (rawNumbers) {
    for (const num of rawNumbers) {
      if (!normalizedSeen.has(num)) {
        normalizedSeen.add(num);
        found.add(num);
      }
    }
  }

  return Array.from(found);
}

export interface MetricValidationResult {
  /** All metrics successfully preserved in the tailored text */
  preservedMetrics: string[];
  /** Metrics present in original text but missing in tailored output */
  droppedMetrics: string[];
  /** True if all extracted metrics from the original bullet were preserved */
  isInvariant: boolean;
  /** Adjusted tailored text with dropped metrics safely restored if necessary */
  sanitizedTailoredText: string;
}

/**
 * Programmatically asserts that numbers and metrics from originalBullet were not dropped or inflated in tailoredBullet.
 * If a critical metric was dropped, it safely reconciles the output to maintain candidate credibility.
 */
export function validateMetricInvariance(
  originalBullet: string,
  tailoredBullet: string
): MetricValidationResult {
  const originalMetrics = extractMetrics(originalBullet);
  const tailoredMetrics = extractMetrics(tailoredBullet);

  const tailoredNormalized = new Set(tailoredMetrics.map(normalizeMetric));
  const originalNormalized = originalMetrics.map((m) => ({ raw: m, norm: normalizeMetric(m) }));

  const preservedMetrics: string[] = [];
  const droppedMetrics: string[] = [];

  for (const item of originalNormalized) {
    if (tailoredNormalized.has(item.norm)) {
      preservedMetrics.push(item.raw);
    } else {
      // Check substring presence in tailored text as fallback
      if (tailoredBullet.toLowerCase().includes(item.norm)) {
        preservedMetrics.push(item.raw);
      } else {
        droppedMetrics.push(item.raw);
      }
    }
  }

  const isInvariant = droppedMetrics.length === 0;
  let sanitizedTailoredText = tailoredBullet.trim();

  // If critical metrics (like percentages or dollar values) were dropped by the LLM, reconcile
  if (!isInvariant) {
    const criticalDrops = droppedMetrics.filter((m) => m.includes("%") || m.startsWith("$") || m.includes("k") || m.includes("M"));
    if (criticalDrops.length > 0) {
      // Ensure sentence doesn't end with double punctuation
      const cleanEnd = sanitizedTailoredText.replace(/[.,;:]+$/, "");
      sanitizedTailoredText = `${cleanEnd} (${criticalDrops.join(", ")}).`;
    }
  }

  return {
    preservedMetrics,
    droppedMetrics,
    isInvariant,
    sanitizedTailoredText,
  };
}

