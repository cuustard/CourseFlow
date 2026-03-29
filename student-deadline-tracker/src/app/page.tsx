"use client";

import { useMemo, useState } from "react";
import AddAssessmentForm from "@/components/add-assessment-form";
import GanttPlanner from "@/components/gantt-planner";
import SummaryCard from "@/components/summary-card";
import { assessments as initialAssessments, modules } from "@/data/mock-data";
import type { Assessment } from "@/types";

type AssessmentFilter = "all" | "exam" | "coursework";

export default function HomePage() {
    const [showForm, setShowForm] = useState(false);
    const [assessmentItems, setAssessmentItems] =
        useState<Assessment[]>(initialAssessments);

    const [typeFilter, setTypeFilter] = useState<AssessmentFilter>("all");
    const [moduleFilter, setModuleFilter] = useState<string>("all");

    const filteredAssessments = useMemo(() => {
        return assessmentItems
            .filter((assessment) => {
                if (typeFilter === "all") return true;
                return assessment.type === typeFilter;
            })
            .filter((assessment) => {
                if (moduleFilter === "all") return true;
                return assessment.moduleId === moduleFilter;
            });
    }, [assessmentItems, typeFilter, moduleFilter]);

    const nextUpcomingItem = useMemo(() => {
        const now = new Date().getTime();

        const allMoments = filteredAssessments.flatMap((assessment) => {
            const items = [
                {
                    label: assessment.title,
                    dueAt: assessment.dueAt,
                },
            ];

            if (assessment.components) {
                for (const component of assessment.components) {
                    items.push({
                        label: `${assessment.title} — ${component.title}`,
                        dueAt: component.dueAt,
                    });
                }
            }

            return items;
        });

        return allMoments
            .filter((item) => new Date(item.dueAt).getTime() >= now)
            .sort(
                (a, b) =>
                    new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
            )[0];
    }, [filteredAssessments]);

    function handleAddAssessment(newAssessment: Assessment) {
        setAssessmentItems((prev) => [...prev, newAssessment]);
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Student Deadline Tracker
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Visualise exams, coursework, and multi-part submissions
                        more clearly.
                    </p>
                </header>

                <section className="mb-6">
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        className="mb-4 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
                    >
                        {showForm ? "Hide form" : "Add assessment"}
                    </button>

                    {showForm && (
                        <AddAssessmentForm
                            modules={modules}
                            onAddAssessment={handleAddAssessment}
                        />
                    )}
                </section>

                <section className="mb-6 grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        label="Visible Assessments"
                        value={filteredAssessments.length}
                    />
                    <SummaryCard
                        label="Modules in View"
                        value={
                            new Set(
                                filteredAssessments.map(
                                    (assessment) => assessment.moduleId
                                )
                            ).size
                        }
                    />
                    <SummaryCard
                        label="Next Upcoming"
                        value={
                            nextUpcomingItem ? nextUpcomingItem.label : "None"
                        }
                        helperText={
                            nextUpcomingItem
                                ? new Date(
                                      nextUpcomingItem.dueAt
                                  ).toLocaleString()
                                : "No upcoming deadlines"
                        }
                    />
                </section>

                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                            <label
                                htmlFor="typeFilter"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Filter by type
                            </label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(
                                        e.target.value as AssessmentFilter
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                            >
                                <option value="all">All</option>
                                <option value="exam">Exams</option>
                                <option value="coursework">Coursework</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label
                                htmlFor="moduleFilter"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Filter by module
                            </label>
                            <select
                                id="moduleFilter"
                                value={moduleFilter}
                                onChange={(e) =>
                                    setModuleFilter(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                            >
                                <option value="all">All modules</option>
                                {modules.map((moduleItem) => (
                                    <option
                                        key={moduleItem.id}
                                        value={moduleItem.id}
                                    >
                                        {moduleItem.name}
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
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            Clear filters
                        </button>
                    </div>
                </section>

                <GanttPlanner assessments={filteredAssessments} />
            </div>
        </main>
    );
}
