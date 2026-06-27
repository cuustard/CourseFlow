"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";
import {
    BOUNDARIES,
    calcModuleAgg,
    getClassification,
    requiredForTarget,
} from "@/lib/gradeUtils";
import { Module } from "@/lib/types";
import GaugeDial from "./GaugeDial";

const TARGETS = BOUNDARIES.slice(0, 4); // exclude Fail

// ── Sort ─────────────────────────────────────────────────────────────────────

type SortOption =
    | "closest-next"
    | "closest-first"
    | "highest-required"
    | "most-at-risk"
    | "most-remaining"
    | "name";

const SORT_LABELS: Record<SortOption, string> = {
    "closest-next": "Closest to Next Classification",
    "closest-first": "Closest to First",
    "highest-required": "Highest Required Grade",
    "most-at-risk": "Most At Risk",
    "most-remaining": "Most Assessments Remaining",
    name: "Module Name (A–Z)",
};

function computeData(m: Module) {
    const r = calcModuleAgg(m);
    const currentAgg = r ? r.effectiveAgg : 0;
    const currentCls = getClassification(currentAgg);
    const pendingAss = m.assessments.filter((a) => a.grade === null);
    const pendingWeight = pendingAss.reduce((s, a) => s + a.weight, 0);
    const reqs = TARGETS.map((t) => ({
        target: t,
        result: requiredForTarget(m, t.agg),
    }));

    // One step up from current classification (null if already at First)
    const currentClsIndex = BOUNDARIES.findIndex(
        (b) => b.cls === currentCls.cls,
    );
    const nextTarget =
        currentClsIndex > 0 ? BOUNDARIES[currentClsIndex - 1] : null;
    const nextReq = nextTarget ? requiredForTarget(m, nextTarget.agg) : null;

    const reqForFirst = requiredForTarget(m, BOUNDARIES[0].agg);

    return {
        m,
        currentAgg,
        currentCls,
        pendingAss,
        pendingWeight,
        reqs,
        nextTarget,
        nextReq,
        reqForFirst,
    };
}

type ModuleData = ReturnType<typeof computeData>;

// Sentinel sort values that fall outside the 0–100 % range
const SORT_ACHIEVED = -1; // already there → float to top
const SORT_IMPOSSIBLE = 101; // can't reach → sink to bottom
const SORT_NO_TARGET = 102; // already at First for closest-next → sink last

function sortValue(
    pct: number | null | undefined,
    status: string | undefined,
): number {
    if (status === "achieved") return SORT_ACHIEVED;
    if (status === "impossible" || pct === null || pct === undefined)
        return SORT_IMPOSSIBLE;
    return pct;
}

function sorted(data: ModuleData[], by: SortOption): ModuleData[] {
    return [...data].sort((a, b) => {
        switch (by) {
            case "closest-first": {
                const sa = sortValue(
                    a.reqForFirst?.pct,
                    a.reqForFirst?.status,
                );
                const sb = sortValue(
                    b.reqForFirst?.pct,
                    b.reqForFirst?.status,
                );
                return sa - sb;
            }
            case "closest-next": {
                const sa = !a.nextTarget
                    ? SORT_NO_TARGET
                    : sortValue(a.nextReq?.pct, a.nextReq?.status);
                const sb = !b.nextTarget
                    ? SORT_NO_TARGET
                    : sortValue(b.nextReq?.pct, b.nextReq?.status);
                return sa - sb;
            }
            case "highest-required": {
                // Descending — modules needing the highest grade to reach First appear first
                const sa = sortValue(
                    a.reqForFirst?.pct,
                    a.reqForFirst?.status,
                );
                const sb = sortValue(
                    b.reqForFirst?.pct,
                    b.reqForFirst?.status,
                );
                return sb - sa;
            }
            case "most-at-risk": {
                // Risk = low current score × high pending weight
                const ra = (1 - a.currentAgg / 24) * (a.pendingWeight / 100);
                const rb = (1 - b.currentAgg / 24) * (b.pendingWeight / 100);
                return rb - ra;
            }
            case "most-remaining":
                return b.pendingAss.length - a.pendingAss.length;
            case "name":
                return a.m.name.localeCompare(b.m.name);
        }
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RequiredGrades() {
    const modules = useAcademicStore((s) => s.modules);
    const [sortBy, setSortBy] = useState<SortOption>("closest-next");

    const sortedData = useMemo(() => {
        const pending = modules.filter((m) =>
            m.assessments.some((a) => a.grade === null),
        );
        return sorted(pending.map(computeData), sortBy);
    }, [modules, sortBy]);

    if (sortedData.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                    Required Grades
                </h1>
                <p
                    className="text-[13px] mb-7"
                    style={{ color: "var(--text2)" }}
                >
                    What do you need in remaining assessments?
                </p>
                <div
                    className="text-center py-16"
                    style={{ color: "var(--text2)" }}
                >
                    <div className="text-[32px] mb-3">✓</div>
                    <div>No pending assessments</div>
                    <div
                        className="text-[12px] mt-1.5"
                        style={{ color: "var(--text3)" }}
                    >
                        All assessments are complete — well done!
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page header + sort control */}
            <div className="flex items-start justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                        Required Grades
                    </h1>
                    <p
                        className="text-[13px]"
                        style={{ color: "var(--text2)" }}
                    >
                        What do you need in remaining assessments to hit each
                        classification?
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                    <span
                        className="text-[11px]"
                        style={{ color: "var(--text3)" }}
                    >
                        Sort by
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value as SortOption)
                        }
                        className="text-[12px] px-2.5 py-1.5 rounded-md outline-none cursor-pointer"
                        style={{
                            background: "var(--bg2)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                    >
                        {(Object.keys(SORT_LABELS) as SortOption[]).map(
                            (key) => (
                                <option key={key} value={key}>
                                    {SORT_LABELS[key]}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </div>

            {/* Module cards */}
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                }}
            >
                {sortedData.map(
                    ({
                        m,
                        currentAgg,
                        currentCls,
                        pendingAss,
                        reqs,
                        nextTarget,
                        nextReq,
                    }) => (
                        <div
                            key={m.id}
                            className="rounded-[10px] p-4 flex flex-col"
                            style={{
                                background: "var(--bg2)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {/* Module name + meta */}
                            <div className="mb-3">
                                <h2 className="text-[15px] font-medium tracking-tight leading-tight">
                                    {m.name}
                                </h2>
                                <div
                                    className="text-[11px] mt-0.5"
                                    style={{ color: "var(--text2)" }}
                                >
                                    {m.credits} credits · {pendingAss.length}{" "}
                                    assessment
                                    {pendingAss.length !== 1 ? "s" : ""}{" "}
                                    remaining
                                </div>
                            </div>

                            {/* Gauge */}
                            <div className="flex justify-center mb-1">
                                <div className="w-[180px]">
                                    <GaugeDial agg={currentAgg} />
                                </div>
                            </div>
                            <div className="flex justify-center mb-4">
                                <span
                                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        background: currentCls.color + "20",
                                        color: currentCls.color,
                                    }}
                                >
                                    {currentCls.label}
                                </span>
                            </div>

                            {/* Next target callout */}
                            {nextTarget && nextReq && (
                                <div
                                    className="rounded-md px-3 py-2.5 mb-3"
                                    style={{
                                        background: nextTarget.color + "12",
                                        border: `1px solid ${nextTarget.color}40`,
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className="text-[10px] uppercase tracking-[0.06em]"
                                            style={{ color: "var(--text3)" }}
                                        >
                                            Next Target
                                        </span>
                                        <span
                                            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                                            style={{
                                                background:
                                                    nextTarget.color + "25",
                                                color: nextTarget.color,
                                            }}
                                        >
                                            {nextTarget.short}
                                        </span>
                                    </div>
                                    <div
                                        className="text-[14px] font-semibold"
                                        style={{ color: nextTarget.color }}
                                    >
                                        {nextReq.status === "achieved"
                                            ? "✓ Already secured"
                                            : nextReq.status === "impossible"
                                              ? "✗ Not reachable"
                                              : `Need ${nextReq.pct}%`}
                                    </div>
                                </div>
                            )}

                            {/* Pending assessments */}
                            <div className="mb-3">
                                <span
                                    className="text-[11px]"
                                    style={{ color: "var(--text3)" }}
                                >
                                    Pending:{" "}
                                </span>
                                {pendingAss.map((a) => (
                                    <span
                                        key={a.id}
                                        className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded text-[10px]"
                                        style={{
                                            background: "var(--bg3)",
                                            border: "1px solid var(--border)",
                                            color: "var(--text2)",
                                        }}
                                    >
                                        {a.name} ({a.weight}%)
                                    </span>
                                ))}
                            </div>

                            {/* Classification chips */}
                            <div className="flex flex-wrap gap-1.5">
                                {reqs.map(({ target, result }) => {
                                    const impossible =
                                        !result ||
                                        result.status === "impossible";
                                    const achieved =
                                        result?.status === "achieved";
                                    const tight = result?.status === "tight";
                                    const label = achieved
                                        ? "✓"
                                        : impossible
                                          ? "✗"
                                          : `${result!.pct}%`;

                                    return (
                                        <span
                                            key={target.cls}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                                            style={{
                                                background: impossible
                                                    ? "var(--bg3)"
                                                    : target.color +
                                                      (tight ? "25" : "18"),
                                                border: `1px solid ${
                                                    impossible
                                                        ? "var(--border)"
                                                        : target.color + "50"
                                                }`,
                                                color: impossible
                                                    ? "var(--text3)"
                                                    : target.color,
                                                opacity: impossible ? 0.5 : 1,
                                            }}
                                        >
                                            <span style={{ opacity: 0.75 }}>
                                                {target.short}
                                            </span>
                                            <span>{label}</span>
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Directional action — jump to this module's deadlines */}
                            <Link
                                href={{
                                    pathname: "/timeline",
                                    query: { module: m.id },
                                }}
                                className="gt-btn-ghost gt-btn-sm mt-4 justify-center"
                            >
                                View deadlines on timeline{" "}
                                <ArrowRight size={12} />
                            </Link>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
