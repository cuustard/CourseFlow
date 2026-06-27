"use client";

import { useEffect, useMemo, useState } from "react";
import AddAssessmentForm from "@/components/add-assessment-form";
import GanttPlanner from "@/components/gantt-planner";
import SummaryCard from "@/components/summary-card";
import { assessments as initialAssessments, modules } from "@/data/mock-data";
import type { Assessment } from "@/types";

const STORAGE_KEY = "assessmentItems";

type AssessmentFilter = "all" | "exam" | "coursework";

export default function HomePage() {
    const [showForm, setShowForm] = useState(false);
    const [assessmentItems, setAssessmentItems] = useState<Assessment[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved) as Assessment[];
        } catch {
            // localStorage unavailable (SSR, private mode, etc.)
        }
        return initialAssessments;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(assessmentItems));
        } catch {
            // ignore write failures
        }
    }, [assessmentItems]);

    const [typeFilter, setTypeFilter] = useState<AssessmentFilter>("all");
    const [moduleFilter, setModuleFilter] = useState<string>("all");

    const filteredAssessments = useMemo(() => {
        return assessmentItems
            .filter((a) => typeFilter === "all" || a.type === typeFilter)
            .filter((a) => moduleFilter === "all" || a.moduleId === moduleFilter);
    }, [assessmentItems, typeFilter, moduleFilter]);

    const { modulesInView, nextUpcomingItem, hasPastDeadlines } = useMemo(() => {
        const now = new Date().getTime();
        const moduleIds = new Set<string>();
        const moments: { label: string; dueAt: string }[] = [];

        for (const assessment of filteredAssessments) {
            moduleIds.add(assessment.moduleId);

            if (assessment.components && assessment.components.length > 0) {
                for (const component of assessment.components) {
                    moments.push({
                        label: `${assessment.title} — ${component.title}`,
                        dueAt: component.dueAt,
                    });
                }
            } else {
                moments.push({ label: assessment.title, dueAt: assessment.dueAt });
            }
        }

        const upcoming = moments
            .filter((item) => new Date(item.dueAt).getTime() >= now)
            .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];

        const hasPast = moments.some((item) => new Date(item.dueAt).getTime() < now);

        return {
            modulesInView: moduleIds.size,
            nextUpcomingItem: upcoming,
            hasPastDeadlines: hasPast,
        };
    }, [filteredAssessments]);

    function handleAddAssessment(newAssessment: Assessment) {
        setAssessmentItems((prev) => [...prev, newAssessment]);
    }

    // Derive the "Next Upcoming" card's empty-state messaging
    const nextUpcomingEmptyLabel = hasPastDeadlines
        ? "No immediate deadlines"
        : "None yet";
    const nextUpcomingEmptyHelper = hasPastDeadlines
        ? "All upcoming deadlines are cleared."
        : "Add an assessment to get started.";

    return (
        <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Page header */}
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Student Deadline Tracker
                        </h1>
                        <p className="mt-1 text-slate-500">
                            Visualise exams, coursework, and multi-part
                            submissions in one place.
                        </p>
                    </div>

                    {/* "Add assessment" lives here; form has its own close button */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                            + Add assessment
                        </button>
                    )}
                </header>

                {/* Collapsible add-assessment form */}
                {showForm && (
                    <AddAssessmentForm
                        modules={modules}
                        onAddAssessment={(a) => {
                            handleAddAssessment(a);
                            setShowForm(false);
                        }}
                        onClose={() => setShowForm(false)}
                    />
                )}

                {/* Metric cards */}
                <section className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        label="Visible Assessments"
                        value={filteredAssessments.length}
                        helperText={
                            filteredAssessments.length === 0
                                ? "Try clearing your filters."
                                : undefined
                        }
                    />
                    <SummaryCard
                        label="Modules in View"
                        value={modulesInView}
                    />
                    <SummaryCard
                        label="Next Upcoming"
                        value={
                            nextUpcomingItem
                                ? nextUpcomingItem.label
                                : nextUpcomingEmptyLabel
                        }
                        helperText={
                            nextUpcomingItem
                                ? new Date(nextUpcomingItem.dueAt).toLocaleString()
                                : nextUpcomingEmptyHelper
                        }
                        variant={nextUpcomingItem ? "default" : "muted"}
                        action={
                            !nextUpcomingItem && !hasPastDeadlines ? (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                                >
                                    Add an assessment →
                                </button>
                            ) : undefined
                        }
                    />
                </section>

                {/* Filters */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label
                                htmlFor="typeFilter"
                                className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide"
                            >
                                Type
                            </label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(e.target.value as AssessmentFilter)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                            >
                                <option value="all">All types</option>
                                <option value="exam">Exams</option>
                                <option value="coursework">Coursework</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label
                                htmlFor="moduleFilter"
                                className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide"
                            >
                                Module
                            </label>
                            <select
                                id="moduleFilter"
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                            disabled={typeFilter === "all" && moduleFilter === "all"}
                            className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Clear filters
                        </button>
                    </div>
                </section>

                {/* Gantt planner */}
                <GanttPlanner
                    assessments={filteredAssessments}
                    modules={modules}
                />
            </div>
        </main>
    );
}
