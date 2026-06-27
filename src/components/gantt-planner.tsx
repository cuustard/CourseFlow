"use client";

import { useRef } from "react";
import type { Assessment, Module } from "@/types";
import ModuleBadge from "./module-badge";

type GanttPlannerProps = {
    assessments: Assessment[];
    modules: Module[];
};

function startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

function diffInDays(start: Date, end: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round(
        (startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay
    );
}

function isWeekend(date: Date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function formatDay(date: Date) {
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
    });
}

function formatWeekday(date: Date) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
}

function getAssessmentStartDate(assessment: Assessment) {
    if (assessment.type === "exam") return new Date(assessment.dueAt);

    if (assessment.components?.length) {
        return new Date(
            [...assessment.components].sort(
                (a, b) =>
                    new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
            )[0].dueAt
        );
    }

    return new Date(assessment.dueAt);
}

function getRange(assessments: Assessment[]) {
    const today = startOfDay(new Date());

    if (!assessments.length) {
        return { start: addDays(today, -2), end: addDays(today, 20) };
    }

    const dates = assessments.flatMap((a) => [
        new Date(a.dueAt),
        ...(a.components?.map((c) => new Date(c.dueAt)) ?? []),
    ]);

    const minMs = dates.reduce((min, d) => Math.min(min, d.getTime()), Infinity);
    const maxMs = dates.reduce((max, d) => Math.max(max, d.getTime()), -Infinity);

    // Always include today so the current date is visible
    return {
        start: addDays(new Date(Math.min(minMs, today.getTime())), -2),
        end: addDays(new Date(Math.max(maxMs, today.getTime())), 3),
    };
}

function ChevronLeftIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export default function GanttPlanner({ assessments, modules }: GanttPlannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { start, end } = getRange(assessments);

    const days = Array.from({ length: diffInDays(start, end) + 1 }, (_, i) =>
        addDays(start, i)
    );

    const dayWidth = 60;
    const labelWidth = 240;
    const width = days.length * dayWidth;
    const rowStyle = { gridTemplateColumns: `${labelWidth}px ${width}px` };
    const colStyle = { gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)` };

    const todayIndex = days.findIndex(
        (d) => startOfDay(d).getTime() === startOfDay(new Date()).getTime()
    );

    function scrollByWeek(direction: -1 | 1) {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += direction * 7 * dayWidth;
        }
    }

    function jumpToToday() {
        if (scrollRef.current && todayIndex >= 0) {
            const containerWidth = scrollRef.current.clientWidth - labelWidth;
            scrollRef.current.scrollLeft =
                todayIndex * dayWidth - containerWidth / 2 + dayWidth / 2;
        }
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Planner header + nav controls */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-base font-semibold text-slate-900">Planner</h2>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => scrollByWeek(-1)}
                        aria-label="Scroll back one week"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        type="button"
                        onClick={jumpToToday}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByWeek(1)}
                        aria-label="Scroll forward one week"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto p-4" ref={scrollRef}>
                <div style={{ width: labelWidth + width }} className="min-w-max">
                    {/* Header row */}
                    <div className="grid border-b border-slate-200 pb-2" style={rowStyle}>
                        <div className="text-xs font-medium text-slate-400">
                            Assessment
                        </div>

                        <div className="grid" style={colStyle}>
                            {days.map((d, i) => (
                                <div
                                    key={d.toISOString()}
                                    className={`text-center text-xs ${
                                        isWeekend(d) ? "bg-slate-50" : ""
                                    } ${
                                        i === todayIndex
                                            ? "font-bold text-red-500"
                                            : "text-slate-500"
                                    }`}
                                >
                                    <div className="text-[10px] text-slate-400">
                                        {formatWeekday(d)}
                                    </div>
                                    <div>{formatDay(d)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assessment rows */}
                    {assessments.length === 0 && (
                        <div className="py-10 text-center text-sm text-slate-400">
                            No assessments to display. Add one above.
                        </div>
                    )}

                    {assessments.map((a) => {
                        const moduleData = modules.find((m) => m.id === a.moduleId);

                        const startDate = getAssessmentStartDate(a);
                        const endDate = new Date(a.dueAt);

                        const startOffset = diffInDays(start, startDate);
                        const endOffset = diffInDays(start, endDate);

                        const barLeft = Math.min(startOffset, endOffset);
                        const barRight = Math.max(startOffset, endOffset);

                        const left = barLeft * dayWidth;
                        const barPadding = 6;
                        const widthBar =
                            a.type === "exam"
                                ? dayWidth
                                : Math.max(
                                      (barRight - barLeft + 1) * dayWidth,
                                      dayWidth
                                  );

                        return (
                            <div
                                key={a.id}
                                className="group grid border-b border-slate-100 last:border-b-0"
                                style={rowStyle}
                            >
                                {/* Label column */}
                                <div className="flex flex-col justify-center gap-1 py-3 pr-4 group-hover:bg-slate-50/60">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {a.title}
                                        </p>
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                                            {a.type}
                                        </span>
                                    </div>
                                    {moduleData && (
                                        <ModuleBadge
                                            name={moduleData.name}
                                            color={moduleData.color}
                                        />
                                    )}
                                </div>

                                {/* Timeline column */}
                                <div className="relative h-16 group-hover:bg-slate-50/60">
                                    {/* Column grid — weekend shading */}
                                    <div
                                        className="absolute inset-0 grid"
                                        style={colStyle}
                                    >
                                        {days.map((d) => (
                                            <div
                                                key={d.toISOString()}
                                                className={`border-l border-slate-100 ${
                                                    isWeekend(d)
                                                        ? "bg-slate-50/70"
                                                        : ""
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Today dashed line */}
                                    {todayIndex >= 0 && (
                                        <div
                                            className="absolute bottom-0 top-0 z-20 w-[2px]"
                                            style={{
                                                left: todayIndex * dayWidth,
                                                background:
                                                    "repeating-linear-gradient(to bottom, #ef4444, #ef4444 4px, transparent 4px, transparent 9px)",
                                            }}
                                        />
                                    )}

                                    {/* Coursework bar */}
                                    {a.type === "coursework" && (
                                        <div
                                            className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full opacity-90"
                                            style={{
                                                left: left + barPadding,
                                                width: widthBar - barPadding * 2,
                                                backgroundColor:
                                                    moduleData?.color ?? "#94a3b8",
                                            }}
                                        />
                                    )}

                                    {/* Exam dot */}
                                    {a.type === "exam" && (
                                        <div
                                            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-900"
                                            style={{
                                                left: left + dayWidth / 2 - 8,
                                            }}
                                        />
                                    )}

                                    {/* Component dots */}
                                    {a.components?.map((c) => {
                                        const offset = diffInDays(
                                            start,
                                            new Date(c.dueAt)
                                        );
                                        return (
                                            <div
                                                key={c.id}
                                                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-white"
                                                style={{
                                                    left:
                                                        offset * dayWidth +
                                                        dayWidth / 2 -
                                                        6,
                                                    backgroundColor:
                                                        moduleData?.color ?? "#1e293b",
                                                }}
                                                title={c.title}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
