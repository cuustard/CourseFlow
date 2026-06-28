"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Settings2 } from "lucide-react";
import {
    useAcademicStore,
    useTimelineDeadlines,
} from "@/store/useAcademicStore";
import { nextUrgentMoment } from "@/lib/timelineUtils";
import SummaryCard from "./SummaryCard";
import GanttPlanner from "./GanttPlanner";
import DeadlineList from "./DeadlineList";

type TypeFilter = "all" | "exam" | "coursework";

export default function TimelineView() {
    const searchParams = useSearchParams();
    const modules = useAcademicStore((s) => s.modules);
    const modulesLoaded = useAcademicStore((s) => s.modulesLoaded);

    // Read-only projection of the modules collection — the single source of truth.
    const deadlines = useTimelineDeadlines();

    const moduleParam = searchParams.get("module");

    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [moduleFilter, setModuleFilter] = useState<string>(
        moduleParam ?? "all",
    );

    // Keep the module filter in sync with the `?module=` deep link without an
    // effect (React's "adjust state during render" pattern): when the param
    // changes — arriving from a "View on timeline" link or back/forward
    // navigation — reset the filter to match. Manual dropdown selections
    // persist until the param next changes.
    const [syncedParam, setSyncedParam] = useState(moduleParam);
    if (moduleParam !== syncedParam) {
        setSyncedParam(moduleParam);
        setModuleFilter(moduleParam ?? "all");
    }

    const filtered = useMemo(() => {
        return deadlines
            .filter((d) => typeFilter === "all" || d.type === typeFilter)
            .filter(
                (d) => moduleFilter === "all" || d.moduleId === moduleFilter,
            );
    }, [deadlines, typeFilter, moduleFilter]);

    const { modulesInView, next } = useMemo(() => {
        const ids = new Set<string>();
        for (const d of filtered) ids.add(d.moduleId);
        return {
            modulesInView: ids.size,
            next: nextUrgentMoment(filtered),
        };
    }, [filtered]);

    const activeModuleName =
        moduleFilter !== "all"
            ? (modules.find((m) => m.id === moduleFilter)?.name ?? null)
            : null;

    const filtersActive = typeFilter !== "all" || moduleFilter !== "all";

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                        Timeline
                    </h1>
                    <p
                        className="text-[13px]"
                        style={{ color: "var(--text2)" }}
                    >
                        A read-only view of every exam and coursework deadline,
                        built from your modules.
                        {activeModuleName && (
                            <>
                                {" "}
                                Filtered to{" "}
                                <strong style={{ color: "var(--text)" }}>
                                    {activeModuleName}
                                </strong>
                                .
                            </>
                        )}
                    </p>
                </div>

                {/* Source of truth lives in Modules — route there to make changes */}
                <Link href="/modules" className="gt-btn-primary shrink-0">
                    <Settings2 size={14} /> Manage Modules
                </Link>
            </div>

            {/* Filters */}
            <section
                className="rounded-[10px] p-4 mb-5"
                style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                }}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label
                            htmlFor="type-filter"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Type
                        </label>
                        <select
                            id="type-filter"
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value as TypeFilter)
                            }
                            className="gt-input"
                        >
                            <option value="all">All types</option>
                            <option value="exam">Exams</option>
                            <option value="coursework">Coursework</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label
                            htmlFor="module-filter"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Module
                        </label>
                        <select
                            id="module-filter"
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="gt-input"
                        >
                            <option value="all">All modules</option>
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter("all");
                            setModuleFilter("all");
                        }}
                        disabled={!filtersActive}
                        className="gt-btn-ghost shrink-0"
                        style={{ opacity: filtersActive ? 1 : 0.4 }}
                    >
                        Clear filters
                    </button>
                </div>
            </section>

            {/* Summary cards */}
            <section className="grid gap-4 md:grid-cols-3 mb-5">
                <SummaryCard
                    label="Visible Deadlines"
                    value={filtered.length}
                    helperText={
                        filtered.length === 0
                            ? modules.length === 0
                                ? "Add a module and assessment dates first."
                                : "Try clearing your filters."
                            : undefined
                    }
                />
                <SummaryCard label="Modules in View" value={modulesInView} />
                <SummaryCard
                    label="Next Upcoming"
                    value={
                        next
                            ? next.kind === "component"
                                ? `${next.deadlineTitle} — ${next.title}`
                                : next.title
                            : "None"
                    }
                    helperText={
                        next
                            ? new Date(next.dueAt).toLocaleString()
                            : "All upcoming deadlines are cleared."
                    }
                    variant={next ? "default" : "muted"}
                />
            </section>

            {/* Empty-state nudge when no assessment carries a date yet */}
            {modulesLoaded && deadlines.length === 0 && (
                <div
                    className="rounded-[10px] p-6 mb-5 text-center"
                    style={{
                        background: "var(--bg2)",
                        border: "1px dashed var(--border2)",
                    }}
                >
                    <div className="text-[28px] mb-2">🗓️</div>
                    <div className="text-[13px]" style={{ color: "var(--text2)" }}>
                        Nothing scheduled yet
                    </div>
                    <div
                        className="text-[12px] mt-1"
                        style={{ color: "var(--text3)" }}
                    >
                        Add exam or coursework dates to your assessments and they
                        appear here automatically.
                    </div>
                    <Link
                        href="/modules"
                        className="gt-btn-ghost gt-btn-sm mt-4 justify-center inline-flex"
                    >
                        <Settings2 size={12} /> Go to Modules
                    </Link>
                </div>
            )}

            {/* Gantt planner */}
            <GanttPlanner deadlines={filtered} />

            {/* Deadline detail list — read-only */}
            <DeadlineList deadlines={filtered} />

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
