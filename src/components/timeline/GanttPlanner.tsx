"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Deadline } from "@/lib/types";
import { moduleColor } from "@/lib/moduleColors";
import ModuleBadge from "./ModuleBadge";

type GanttPlannerProps = {
    deadlines: Deadline[];
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
        (startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay,
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

/** Earliest meaningful point for a deadline — where its bar/marker begins. */
function getDeadlineStartDate(deadline: Deadline) {
    if (deadline.type === "exam") return new Date(deadline.endDate);
    return new Date(deadline.startDate ?? deadline.endDate);
}

function getRange(deadlines: Deadline[]) {
    const today = startOfDay(new Date());

    if (!deadlines.length) {
        return { start: addDays(today, -2), end: addDays(today, 20) };
    }

    const dates = deadlines.flatMap((d) => [
        new Date(d.endDate),
        ...(d.startDate ? [new Date(d.startDate)] : []),
        ...d.subComponents.map((c) => new Date(c.dueDate)),
    ]);

    const minMs = dates.reduce((min, d) => Math.min(min, d.getTime()), Infinity);
    const maxMs = dates.reduce(
        (max, d) => Math.max(max, d.getTime()),
        -Infinity,
    );

    // Always include today so the current date is visible
    return {
        start: addDays(new Date(Math.min(minMs, today.getTime())), -2),
        end: addDays(new Date(Math.max(maxMs, today.getTime())), 3),
    };
}

export default function GanttPlanner({ deadlines }: GanttPlannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { start, end } = getRange(deadlines);

    const days = Array.from({ length: diffInDays(start, end) + 1 }, (_, i) =>
        addDays(start, i),
    );

    const dayWidth = 60;
    const labelWidth = 240;
    const width = days.length * dayWidth;
    const rowStyle = { gridTemplateColumns: `${labelWidth}px ${width}px` };
    const colStyle = {
        gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
    };

    const todayIndex = days.findIndex(
        (d) => startOfDay(d).getTime() === startOfDay(new Date()).getTime(),
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
        <section
            className="rounded-[10px]"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            {/* Planner header + nav controls */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <h2 className="text-[15px] font-medium tracking-tight">
                    Planner
                </h2>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => scrollByWeek(-1)}
                        aria-label="Scroll back one week"
                        className="rounded-lg p-1.5 transition-colors"
                        style={{
                            border: "1px solid var(--border)",
                            color: "var(--text2)",
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={jumpToToday}
                        className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
                        style={{
                            border: "1px solid var(--border)",
                            color: "var(--text2)",
                        }}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByWeek(1)}
                        aria-label="Scroll forward one week"
                        className="rounded-lg p-1.5 transition-colors"
                        style={{
                            border: "1px solid var(--border)",
                            color: "var(--text2)",
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto p-4" ref={scrollRef}>
                <div style={{ width: labelWidth + width }} className="min-w-max">
                    {/* Header row */}
                    <div
                        className="grid pb-2"
                        style={{
                            ...rowStyle,
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <div
                            className="text-[11px] font-medium"
                            style={{ color: "var(--text3)" }}
                        >
                            Deadline
                        </div>

                        <div className="grid" style={colStyle}>
                            {days.map((d, i) => (
                                <div
                                    key={d.toISOString()}
                                    className="text-center text-[11px]"
                                    style={{
                                        background: isWeekend(d)
                                            ? "var(--bg3)"
                                            : undefined,
                                        color:
                                            i === todayIndex
                                                ? "var(--red)"
                                                : "var(--text3)",
                                        fontWeight:
                                            i === todayIndex ? 700 : 400,
                                    }}
                                >
                                    <div
                                        className="text-[10px]"
                                        style={{ color: "var(--text3)" }}
                                    >
                                        {formatWeekday(d)}
                                    </div>
                                    <div>{formatDay(d)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deadline rows */}
                    {deadlines.length === 0 && (
                        <div
                            className="py-10 text-center text-[13px]"
                            style={{ color: "var(--text3)" }}
                        >
                            No dated assessments to display.
                        </div>
                    )}

                    {deadlines.map((d) => {
                        const color = moduleColor(d.moduleId);

                        const startDate = getDeadlineStartDate(d);
                        const endDate = new Date(d.endDate);

                        const startOffset = diffInDays(start, startDate);
                        const endOffset = diffInDays(start, endDate);

                        const barLeft = Math.min(startOffset, endOffset);
                        const barRight = Math.max(startOffset, endOffset);

                        const left = barLeft * dayWidth;
                        const barPadding = 6;
                        const widthBar =
                            d.type === "exam"
                                ? dayWidth
                                : Math.max(
                                      (barRight - barLeft + 1) * dayWidth,
                                      dayWidth,
                                  );

                        return (
                            <div
                                key={d.id}
                                className="group grid"
                                style={{
                                    ...rowStyle,
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                {/* Label column */}
                                <div className="flex flex-col justify-center gap-1.5 py-3 pr-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[13px] font-medium">
                                            {d.title}
                                        </p>
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px]"
                                            style={{
                                                background: "var(--bg3)",
                                                color: "var(--text2)",
                                            }}
                                        >
                                            {d.type}
                                        </span>
                                    </div>
                                    <ModuleBadge
                                        name={d.moduleName}
                                        color={color}
                                    />
                                </div>

                                {/* Timeline column */}
                                <div className="relative h-16">
                                    {/* Column grid — weekend shading */}
                                    <div
                                        className="absolute inset-0 grid"
                                        style={colStyle}
                                    >
                                        {days.map((day) => (
                                            <div
                                                key={day.toISOString()}
                                                style={{
                                                    borderLeft:
                                                        "1px solid var(--border)",
                                                    background: isWeekend(day)
                                                        ? "var(--bg3)"
                                                        : undefined,
                                                    opacity: isWeekend(day)
                                                        ? 0.4
                                                        : 1,
                                                }}
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
                                    {d.type === "coursework" && (
                                        <div
                                            className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full opacity-90"
                                            style={{
                                                left: left + barPadding,
                                                width:
                                                    widthBar - barPadding * 2,
                                                backgroundColor: color,
                                            }}
                                        />
                                    )}

                                    {/* Exam marker */}
                                    {d.type === "exam" && (
                                        <div
                                            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
                                            style={{
                                                left: left + dayWidth / 2 - 8,
                                                background: color,
                                                border: "2px solid var(--bg)",
                                            }}
                                        />
                                    )}

                                    {/* Milestone dots */}
                                    {d.subComponents.map((c) => {
                                        const offset = diffInDays(
                                            start,
                                            new Date(c.dueDate),
                                        );
                                        return (
                                            <div
                                                key={c.id}
                                                className="absolute top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full"
                                                style={{
                                                    left:
                                                        offset * dayWidth +
                                                        dayWidth / 2 -
                                                        6,
                                                    backgroundColor: color,
                                                    border: "2px solid var(--bg2)",
                                                }}
                                                title={
                                                    c.weight > 0
                                                        ? `${c.title} (${c.weight}%)`
                                                        : c.title
                                                }
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
