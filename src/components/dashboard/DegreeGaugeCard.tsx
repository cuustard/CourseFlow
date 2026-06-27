"use client";

import { useAcademicStore } from "@/store/useAcademicStore";
import {
    aggToExactPct,
    calcDegreeAgg,
    getClassification,
} from "@/lib/gradeUtils";
import GaugeDial from "@/components/calculator/GaugeDial";

export default function DegreeGaugeCard() {
    const modules = useAcademicStore((s) => s.modules);
    const degreeAgg = calcDegreeAgg(modules);
    const cls = degreeAgg !== null ? getClassification(degreeAgg.rounded) : null;
    const pctEquiv =
        degreeAgg !== null ? aggToExactPct(degreeAgg.exact).toFixed(1) : null;

    return (
        <div
            className="rounded-[10px] p-5 flex flex-col"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            <h2 className="text-[16px] font-medium mb-1 tracking-tight">
                Degree Classification
            </h2>
            <p className="text-[12px] mb-3" style={{ color: "var(--text3)" }}>
                Credit-weighted aggregation across all graded modules
            </p>

            <div className="flex-1 flex flex-col justify-center">
                <GaugeDial agg={degreeAgg?.rounded ?? 0} />

                <div className="text-center mt-2">
                    {cls ? (
                        <>
                            <span
                                className="text-[12px] px-2.5 py-1 rounded-full font-medium"
                                style={{
                                    background: cls.color + "20",
                                    color: cls.color,
                                }}
                            >
                                {cls.label}
                            </span>
                            {pctEquiv && (
                                <div
                                    className="text-[11px] mt-2"
                                    style={{ color: "var(--text2)" }}
                                >
                                    ≈ {pctEquiv}% overall
                                </div>
                            )}
                        </>
                    ) : (
                        <span
                            className="text-[12px]"
                            style={{ color: "var(--text3)" }}
                        >
                            Add graded assessments to see your classification
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
