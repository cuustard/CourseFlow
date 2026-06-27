"use client";

import { useAcademicStore } from "@/store/useAcademicStore";
import {
    calcDegreeAgg,
    calcModuleAgg,
    getClassification,
    aggToExactPct,
} from "@/lib/gradeUtils";
import KpiCard from "./KpiCard";
import ClassificationBar from "./ClassificationBar";
import ModuleChart from "./ModuleChart";
import DegreeGaugeCard from "./DegreeGaugeCard";
import NextDeadlineCard from "./NextDeadlineCard";

export default function Dashboard() {
    const modules = useAcademicStore((s) => s.modules);
    const modulesLoaded = useAcademicStore((s) => s.modulesLoaded);

    const degreeAgg = calcDegreeAgg(modules);
    const cls = degreeAgg !== null ? getClassification(degreeAgg.rounded) : null;

    let totalAss = 0,
        doneAss = 0,
        doneModules = 0;
    for (const m of modules) {
        for (const a of m.assessments) {
            totalAss++;
            if (a.grade !== null) doneAss++;
        }
        const r = calcModuleAgg(m);
        if (r && r.weightDone === 100) doneModules++;
    }

    const distToFirst =
        degreeAgg !== null && degreeAgg.rounded < 17.5
            ? (17.5 - degreeAgg.rounded).toFixed(1)
            : null;

    // % equivalent uses the unrounded exact agg (matching Lancaster portal)
    const pctEquiv =
        degreeAgg !== null ? aggToExactPct(degreeAgg.exact).toFixed(1) : null;

    return (
        <div className="p-8">
            <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                Dashboard
            </h1>
            <p className="text-[13px] mb-7" style={{ color: "var(--text2)" }}>
                Your academic performance and upcoming deadlines at a glance
            </p>

            {/* KPI grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <KpiCard
                    label="Aggregation Score"
                    value={
                        degreeAgg !== null ? degreeAgg.rounded.toFixed(1) : "—"
                    }
                    sub={pctEquiv ? `≈ ${pctEquiv}% overall` : "Out of 24.0"}
                    accent="accent"
                />
                <KpiCard
                    label="Classification"
                    value={cls ? cls.label : "—"}
                    sub={
                        distToFirst
                            ? `${distToFirst} pts to First`
                            : degreeAgg && degreeAgg.rounded >= 17.5
                              ? "✓ First class"
                              : ""
                    }
                />
                <KpiCard
                    label="Modules"
                    value={`${doneModules}/${modules.length}`}
                    sub="Complete"
                    accent="green"
                />
                <KpiCard
                    label="Assessments"
                    value={String(totalAss - doneAss)}
                    sub="Remaining"
                    accent="amber"
                />
            </div>

            {/* Context row — degree gauge beside the live next-deadline widget */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <DegreeGaugeCard />
                <NextDeadlineCard />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="rounded-[10px] p-5"
                    style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h2 className="text-[16px] font-medium mb-4 tracking-tight">
                        Classification Progress
                    </h2>
                    <ClassificationBar agg={degreeAgg?.rounded ?? null} />
                </div>

                <div
                    className="rounded-[10px] p-5"
                    style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h2 className="text-[16px] font-medium mb-4 tracking-tight">
                        Module Performance
                    </h2>
                    <div className="h-56">
                        <ModuleChart modules={modules} />
                    </div>
                </div>
            </div>

            {!modulesLoaded && (
                <p
                    className="text-[12px] mt-6"
                    style={{ color: "var(--text3)" }}
                >
                    Syncing with Firestore…
                </p>
            )}
        </div>
    );
}
