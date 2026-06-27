"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAcademicStore } from "@/store/useAcademicStore";
import { nextUrgentMoment } from "@/lib/timelineUtils";
import type { Deadline } from "@/lib/types";
import SummaryCard from "./SummaryCard";
import AddDeadlineForm from "./AddDeadlineForm";
import GanttPlanner from "./GanttPlanner";
import DeadlineList from "./DeadlineList";

type TypeFilter = "all" | "exam" | "coursework";

export default function TimelineView() {
    const searchParams = useSearchParams();
    const deadlines = useAcademicStore((s) => s.deadlines);
    const modules = useAcademicStore((s) => s.modules);
    const deadlinesLoaded = useAcademicStore((s) => s.deadlinesLoaded);
    const addDeadline = useAcademicStore((s) => s.addDeadline);

    const [showForm, setShowForm] = useState(false);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [moduleFilter, setModuleFilter] = useState<string>(
        () => searchParams.get("module") ?? "all",
    );

    const filtered = useMemo(() => {
        return deadlines
            .filter((d) => typeFilter === "all" || d.type === typeFilter)
            .filter(
                (d) => moduleFilter === "all" || d.moduleId === moduleFilter,
            );
    }, [deadlines, typeFilter, moduleFilter]);

    const { modulesInView, next } = useMemo(() => {
        const ids = new Set<string>();
        for (const d of filtered) ids.add(d.moduleId ?? "__unlinked__");
        return {
            modulesInView: ids.size,
            next: nextUrgentMoment(filtered),
        };
    }, [filtered]);

    const activeModuleName =
        moduleFilter !== "all"
            ? (modules.find((m) => m.id === moduleFilter)?.name ?? null)
            : null;

    function handleAddDeadline(deadline: Omit<Deadline, "id" | "createdAt">) {
        void addDeadline(deadline);
        setShowForm(false);
    }

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
                        Visualise exams, coursework and multi-part submissions
                        in one place.
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

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="gt-btn-primary shrink-0"
                    >
                        + Add deadline
                    </button>
                )}
            </div>

            {/* Collapsible add form */}
            {showForm && (
                <AddDeadlineForm
                    modules={modules}
                    defaultModuleId={moduleFilter}
                    onAddDeadline={handleAddDeadline}
                    onClose={() => setShowForm(false)}
                />
            )}

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
                            ? "Try clearing your filters."
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

            {/* Gantt planner */}
            <GanttPlanner deadlines={filtered} modules={modules} />

            {/* Deadline list — completion toggles + delete */}
            <DeadlineList deadlines={filtered} modules={modules} />

            {!deadlinesLoaded && (
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
