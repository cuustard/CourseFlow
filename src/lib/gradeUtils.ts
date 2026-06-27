import {
    Assessment,
    ClassificationBoundary,
    ModuleAggResult,
    RequiredGradeResult,
    Module,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Lancaster University grade-conversion engine — the computational core shared
// by the dashboard, modules, required-grades and reference views.
//
//   Appendix 1 → LETTER_GRADES (letter grade → aggregation score)
//   Appendix 2 → PCT_TO_AGG    (percentage → aggregation score, with the
//                               three-region linear interpolation routing)
// ─────────────────────────────────────────────────────────────────────────────

// ── Appendix 1 — Letter grade → aggregation score + representative % midpoint
export const LETTER_GRADES: Record<
    string,
    { agg: number; pctMid: number; range: string }
> = {
    // pctMid = exact % that maps back to this agg score via the linear formula:
    //   40–80%: agg = 9 + (pct - 40) × 0.300  →  pct = 40 + (agg - 9) / 0.300
    //   0–40%:  agg = pct × 0.225              →  pct = agg / 0.225
    //   >80%:   agg = 21 + (pct - 80) × 0.150 →  pct = 80 + (agg - 21) / 0.150
    "A+": { agg: 24, pctMid: 100, range: "90–100%" }, // 80 + (24-21)/0.150 = 100
    A: { agg: 21, pctMid: 80, range: "80–89.9%" }, // 40 + (21-9)/0.300  = 80
    "A-": { agg: 18, pctMid: 70, range: "70–79.9%" }, // 40 + (18-9)/0.300  = 70
    "B+": { agg: 17, pctMid: 66.67, range: "68–69.9%" }, // 40 + (17-9)/0.300  = 66.67
    B: { agg: 16, pctMid: 63.33, range: "64–67.9%" }, // 40 + (16-9)/0.300  = 63.33
    "B-": { agg: 15, pctMid: 60, range: "60–63.9%" }, // 40 + (15-9)/0.300  = 60
    "C+": { agg: 14, pctMid: 56.67, range: "57–59.9%" }, // 40 + (14-9)/0.300  = 56.67
    C: { agg: 13, pctMid: 53.33, range: "54–56.9%" }, // 40 + (13-9)/0.300  = 53.33
    "C-": { agg: 12, pctMid: 50, range: "50–53.9%" }, // 40 + (12-9)/0.300  = 50
    "D+": { agg: 11, pctMid: 46.67, range: "47–49.9%" }, // 40 + (11-9)/0.300  = 46.67
    D: { agg: 10, pctMid: 43.33, range: "44–46.9%" }, // 40 + (10-9)/0.300  = 43.33
    "D-": { agg: 9, pctMid: 40, range: "40–43.9%" }, // 40 + (9-9)/0.300   = 40
    F1: { agg: 7, pctMid: 31.11, range: "30–39.9%" }, // 7  / 0.225         = 31.11
    F2: { agg: 4, pctMid: 17.78, range: "20–29.9%" }, // 4  / 0.225         = 17.78
    F3: { agg: 2, pctMid: 8.89, range: "10–19.9%" }, // 2  / 0.225         = 8.89
    F4: { agg: 0, pctMid: 0, range: "0–9.9%" }, // 0  / 0.225         = 0
};

// ── Appendix 2 — % → aggregation score (integer indices; interpolation between)
export const PCT_TO_AGG: number[] = [
    0, 0.225, 0.45, 0.675, 0.9, 1.125, 1.35, 1.575, 1.8, 2.025, 2.25, 2.475, 2.7,
    2.925, 3.15, 3.375, 3.6, 3.825, 4.05, 4.275, 4.5, 4.725, 4.95, 5.175, 5.4,
    5.625, 5.85, 6.075, 6.3, 6.525, 6.75, 6.975, 7.2, 7.425, 7.65, 7.875, 8.1,
    8.325, 8.55, 8.775, 9.0, 9.3, 9.6, 9.9, 10.2, 10.5, 10.8, 11.1, 11.4, 11.7,
    12.0, 12.3, 12.6, 12.9, 13.2, 13.5, 13.8, 14.1, 14.4, 14.7, 15.0, 15.3, 15.6,
    15.9, 16.2, 16.5, 16.8, 17.1, 17.4, 17.7, 18.0, 18.3, 18.6, 18.9, 19.2, 19.5,
    19.8, 20.1, 20.4, 20.7, 21.0, 21.15, 21.3, 21.45, 21.6, 21.75, 21.9, 22.05,
    22.2, 22.35, 22.5, 22.65, 22.8, 22.95, 23.1, 23.25, 23.4, 23.55, 23.7, 23.85,
    24.0,
];

// ── Classification boundaries (UG 5.5)
export const BOUNDARIES: ClassificationBoundary[] = [
    {
        label: "First Class Honours",
        short: "1st",
        cls: "first",
        agg: 17.5,
        color: "#7c6ee0",
    },
    {
        label: "Upper Second (2:1)",
        short: "2:1",
        cls: "two1",
        agg: 14.5,
        color: "#3a7bd5",
    },
    {
        label: "Lower Second (2:2)",
        short: "2:2",
        cls: "two2",
        agg: 11.5,
        color: "#3d9970",
    },
    {
        label: "Third Class Honours",
        short: "3rd",
        cls: "third",
        agg: 9.0,
        color: "#d4843a",
    },
    { label: "Fail", short: "Fail", cls: "fail", agg: 0, color: "#c0392b" },
];

// ── Borderline ranges (UG 5.6) — higher class MAY be awarded
export const BORDERLINES = [
    {
        min: 17.1,
        max: 17.4,
        lower: "Upper Second (2:1)",
        higher: "First Class Honours",
        color: "#7c6ee0",
    },
    {
        min: 14.1,
        max: 14.4,
        lower: "Lower Second (2:2)",
        higher: "Upper Second (2:1)",
        color: "#3a7bd5",
    },
    {
        min: 11.1,
        max: 11.4,
        lower: "Third Class Honours",
        higher: "Lower Second (2:2)",
        color: "#3d9970",
    },
    {
        min: 8.1,
        max: 8.9,
        lower: "Fail",
        higher: "Pass Degree",
        color: "#d4843a",
    },
];

export function getBorderline(agg: number) {
    return BORDERLINES.find((b) => agg >= b.min && agg <= b.max) ?? null;
}

/**
 * Convert a decimal % to an aggregation score using linear interpolation
 * between adjacent table entries. Confirmed against Lancaster portal data:
 *
 *   69.7% → 17.700 + 0.7 × 0.300 = 17.910 → displays as 17.9 ✓
 *   65.3% → 16.500 + 0.3 × 0.300 = 16.590 → displays as 16.6 ✓
 *   72.8% → 18.600 + 0.8 × 0.300 = 18.840 → displays as 18.8 ✓
 *
 * The three linear regions of the table:
 *   0–39%:   0.225 per 1%
 *   40–80%:  0.300 per 1%
 *   81–100%: 0.150 per 1%
 */
export function pctToAgg(pct: number): number {
    const clamped = Math.max(0, Math.min(100, pct));
    const lower = Math.floor(clamped);
    const upper = Math.min(100, lower + 1);
    const fraction = clamped - lower;
    return PCT_TO_AGG[lower] + fraction * (PCT_TO_AGG[upper] - PCT_TO_AGG[lower]);
}

/**
 * Reverse conversion: given a target agg score, return the minimum %
 * (to 1 decimal place) required to reach it, using interpolation.
 */
export function aggToPct(targetAgg: number): number | null {
    if (targetAgg <= 0) return 0;
    if (targetAgg > 24) return null;
    for (let p = 0; p < 100; p++) {
        const lo = PCT_TO_AGG[p];
        const hi = PCT_TO_AGG[p + 1];
        if (hi >= targetAgg) {
            if (hi === lo) return p + 1;
            const fraction = (targetAgg - lo) / (hi - lo);
            // Round up to 1dp — you need AT LEAST this percentage
            return Math.ceil((p + fraction) * 10) / 10;
        }
    }
    return null;
}

/**
 * Reverse agg → % using the exact unrounded degree agg.
 * Per Lancaster: 16.1625 → 60 + (16.1625 - 15.000) / 0.300 = 63.875% → 63.9%
 * Uses the 40-80% linear formula directly (valid for typical degree averages).
 */
export function aggToExactPct(agg: number): number {
    if (agg >= 9 && agg <= 21) return 40 + (agg - 9) / 0.3; // 40–80%
    if (agg > 21) return 80 + (agg - 21) / 0.15; // above 80%
    return agg / 0.225; // below 9 (under 40%)
}

export function getClassification(agg: number): ClassificationBoundary {
    for (const b of BOUNDARIES) {
        if (agg >= b.agg) return b;
    }
    return BOUNDARIES[4];
}

/**
 * Get the representative % for an assessment for use in the module mean calculation.
 * - % grade: use directly
 * - Letter grade: use aggToExactPct(agg) — the exact % that the formula maps back to
 *   for that agg score. This ensures pctToAgg(assessmentPct(a)) === agg exactly,
 *   making mixed letter+% modules self-consistent.
 *
 * Example: A (agg=21) → 40 + (21-9)/0.300 = 80%. Using 80% means
 *   pctToAgg(80%) = 21.000, which is exactly the letter's fixed agg score. ✓
 */
function assessmentPct(a: Assessment): number | null {
    if (a.grade === null) return null;
    if (a.gradeType === "letter") {
        const letterData = LETTER_GRADES[a.grade as string];
        if (!letterData) return null;
        return aggToExactPct(letterData.agg);
    }
    return a.grade as number;
}

/**
 * Get agg score for a single assessment — used for per-row display in the module table.
 * (The portal shows individual assessment agg scores too, so we mirror that.)
 */
export function assessmentAgg(a: Assessment): number | null {
    if (a.grade === null) return null;
    if (a.gradeType === "letter")
        return LETTER_GRADES[a.grade as string]?.agg ?? 0;
    return pctToAgg(a.grade as number);
}

/**
 * Calculate a module's aggregation result.
 *
 * Per Lancaster regulations (GR 2.4.11 confirmed by transcript analysis):
 *   Step 1 — Compute the weighted mean % across all graded assessments
 *             (letter grades use their representative % midpoint)
 *   Step 2 — Convert that single module % to an agg score via interpolation
 *
 * This matches the portal exactly:
 *   SCC.111: weighted mean = 57.3% → 14.100 + 0.3×0.300 = 14.190 → shown as 14.2 ✓
 *   SCC.121: weighted mean = 62.8% → 15.600 + 0.8×0.300 = 15.840 → shown as 15.8 ✓
 *   SCC.131: weighted mean = 60.5% → 15.000 + 0.5×0.300 = 15.150 → shown as 15.2 ✓
 *   SCC.141: weighted mean = 78.2% → 20.400 + 0.2×0.300 = 20.460 → shown as 20.5 ✓
 */
export function calcModuleAgg(mod: Module): ModuleAggResult | null {
    let weightedPctSum = 0;
    let wDone = 0;

    for (const a of mod.assessments) {
        const pct = assessmentPct(a);
        if (pct !== null) {
            weightedPctSum += pct * (a.weight / 100);
            wDone += a.weight;
        }
    }

    if (wDone === 0) return null;

    // Weighted mean % of graded assessments
    const weightedMeanPct = weightedPctSum / (wDone / 100);

    // Convert module mean % → agg score (interpolated)
    const moduleAgg = pctToAgg(weightedMeanPct);

    // partialAgg: the agg contribution from graded weight only (used in required grade calc)
    const partialAgg = moduleAgg * (wDone / 100);

    return {
        partialAgg,
        weightDone: wDone,
        effectiveAgg: moduleAgg, // this IS the module agg, regardless of how much weight is done
    };
}

/**
 * Degree average = credit-weighted mean of module agg scores.
 * Returns { rounded, exact } — rounded (1dp) is used for classification and display;
 * exact (unrounded) is used for the % back-conversion per Lancaster portal behaviour.
 */
export function calcDegreeAgg(
    modules: Module[],
): { rounded: number; exact: number } | null {
    let total = 0;
    let credits = 0;
    for (const m of modules) {
        const r = calcModuleAgg(m);
        if (r) {
            total += r.effectiveAgg * m.credits;
            credits += m.credits;
        }
    }
    if (credits === 0) return null;
    const exact = total / credits;
    return { exact, rounded: Math.round(exact * 10) / 10 };
}

export function requiredForTarget(
    mod: Module,
    targetAgg: number,
): RequiredGradeResult | null {
    const r = calcModuleAgg(mod);
    const remaining = 100 - (r ? r.weightDone : 0);
    if (remaining === 0) return null;

    // Work out what module mean % is needed across all assessments (including remaining)
    // partialAgg = moduleAgg × (weightDone/100), so we need:
    // targetAgg × 1.0 = (partialPctContrib + neededPct × remaining/100) → convert via pctToAgg
    // Since the final module agg comes from the overall mean %, we need:
    // pctToAgg(overallMeanPct) = targetAgg
    // overallMeanPct = aggToExactPct(targetAgg)
    // overallMeanPct = (gradedWeightedPct + neededPct × remaining/100)
    // → neededPct = (overallMeanPct × 100 - gradedWeightedPct × 100) / remaining

    const neededOverallPct = aggToExactPct(targetAgg);
    const gradedWeightedPct = r
        ? r.weightDone > 0
            ? mod.assessments
                  .filter((a) => a.grade !== null)
                  .reduce(
                      (s, a) => s + (assessmentPct(a) ?? 0) * (a.weight / 100),
                      0,
                  )
            : 0
        : 0;

    const neededPct =
        (neededOverallPct * 100 - gradedWeightedPct * 100) / remaining;

    if (neededPct <= 0) return { pct: 0, agg: pctToAgg(0), status: "achieved" };
    if (neededPct > 100)
        return { pct: null, agg: pctToAgg(neededPct), status: "impossible" };

    return {
        pct: Math.ceil(neededPct * 10) / 10, // round up to 1dp
        agg: pctToAgg(neededPct),
        status: neededPct >= 85 ? "tight" : "achievable",
    };
}
