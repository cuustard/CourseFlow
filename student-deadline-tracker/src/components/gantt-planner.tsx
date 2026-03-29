import { modules } from "@/data/mock-data";
import type { Assessment } from "@/types";
import ModuleBadge from "./module-badge";

type GanttPlannerProps = {
    assessments: Assessment[];
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

function isToday(date: Date) {
    const today = startOfDay(new Date());
    return startOfDay(date).getTime() === today.getTime();
}

function formatDay(date: Date) {
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
    });
}

function formatWeekday(date: Date) {
    return date.toLocaleDateString(undefined, {
        weekday: "short",
    });
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
        return {
            start: today,
            end: addDays(today, 20),
        };
    }

    const dates = assessments.flatMap((a) => [
        new Date(a.dueAt),
        ...(a.components?.map((c) => new Date(c.dueAt)) ?? []),
    ]);

    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
        start: addDays(min, -2),
        end: addDays(max, 3),
    };
}

export default function GanttPlanner({ assessments }: GanttPlannerProps) {
    const { start, end } = getRange(assessments);

    const days = Array.from({ length: diffInDays(start, end) + 1 }, (_, i) =>
        addDays(start, i)
    );

    const dayWidth = 60;
    const labelWidth = 240;
    const width = days.length * dayWidth;

    return (
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Planner</h2>

            <div className="overflow-x-auto">
                <div
                    style={{ width: labelWidth + width }}
                    className="min-w-max"
                >
                    {/* Header */}
                    <div
                        className="grid border-b pb-3"
                        style={{
                            gridTemplateColumns: `${labelWidth}px ${width}px`,
                        }}
                    >
                        <div className="text-sm text-slate-500">Assessment</div>

                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
                            }}
                        >
                            {days.map((d) => (
                                <div
                                    key={d.toISOString()}
                                    className={`text-center text-xs ${
                                        isWeekend(d) ? "bg-slate-50" : ""
                                    }`}
                                >
                                    <div className="text-[10px] text-slate-400">
                                        {formatWeekday(d)}
                                    </div>
                                    <div className="font-medium">
                                        {formatDay(d)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rows */}
                    {assessments.map((a) => {
                        const moduleData = modules.find(
                            (m) => m.id === a.moduleId
                        );

                        const startDate = getAssessmentStartDate(a);
                        const endDate = new Date(a.dueAt);

                        const startOffset = diffInDays(start, startDate);
                        const endOffset = diffInDays(start, endDate);

                        const left = startOffset * dayWidth;
                        const widthBar =
                            a.type === "exam"
                                ? dayWidth
                                : Math.max(
                                      (endOffset - startOffset + 1) * dayWidth,
                                      dayWidth
                                  );

                        return (
                            <div
                                key={a.id}
                                className="grid py-4 border-b"
                                style={{
                                    gridTemplateColumns: `${labelWidth}px ${width}px`,
                                }}
                            >
                                {/* Left */}
                                <div className="space-y-1 pr-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">
                                            {a.title}
                                        </p>
                                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded">
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

                                {/* Right */}
                                <div className="relative h-16">
                                    {/* Grid */}
                                    <div
                                        className="absolute inset-0 grid"
                                        style={{
                                            gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
                                        }}
                                    >
                                        {days.map((d) => (
                                            <div
                                                key={d.toISOString()}
                                                className={`border-l ${
                                                    isWeekend(d)
                                                        ? "bg-slate-50"
                                                        : ""
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* TODAY LINE */}
                                    {days.map(
                                        (d, i) =>
                                            isToday(d) && (
                                                <div
                                                    key="today"
                                                    className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20"
                                                    style={{
                                                        left: i * dayWidth,
                                                    }}
                                                />
                                            )
                                    )}

                                    {/* BAR */}
                                    {a.type === "coursework" && (
                                        <div
                                            className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full"
                                            style={{
                                                left: left + 6,
                                                width: widthBar - 12,
                                                backgroundColor:
                                                    moduleData?.color ||
                                                    "#94a3b8",
                                            }}
                                        />
                                    )}

                                    {/* EXAM DOT */}
                                    {a.type === "exam" && (
                                        <div
                                            className="absolute top-1/2 w-4 h-4 -translate-y-1/2 rounded-full bg-black"
                                            style={{
                                                left: left + dayWidth / 2 - 8,
                                            }}
                                        />
                                    )}

                                    {/* COMPONENT DOTS */}
                                    {a.components?.map((c) => {
                                        const offset = diffInDays(
                                            start,
                                            new Date(c.dueAt)
                                        );

                                        return (
                                            <div
                                                key={c.id}
                                                className="absolute top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-black"
                                                style={{
                                                    left:
                                                        offset * dayWidth +
                                                        dayWidth / 2 -
                                                        6,
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
