"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";
import { nextUrgentMoment, relativeLabel } from "@/lib/timelineUtils";
import { moduleColor } from "@/lib/moduleColors";

export default function NextDeadlineCard() {
    const deadlines = useAcademicStore((s) => s.deadlines);
    const modules = useAcademicStore((s) => s.modules);

    const next = nextUrgentMoment(deadlines);
    const moduleName = next?.moduleId
        ? (modules.find((m) => m.id === next.moduleId)?.name ?? null)
        : null;

    const timelineHref = next?.moduleId
        ? { pathname: "/timeline", query: { module: next.moduleId } }
        : { pathname: "/timeline" };

    return (
        <div
            className="rounded-[10px] p-5 flex flex-col"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            <div className="flex items-center gap-2 mb-1">
                <CalendarClock size={16} color="var(--accent)" />
                <h2 className="text-[16px] font-medium tracking-tight">
                    Next Urgent Deadline
                </h2>
            </div>
            <p className="text-[12px] mb-4" style={{ color: "var(--text3)" }}>
                The soonest outstanding item from your timeline
            </p>

            {next ? (
                <div className="flex-1 flex flex-col">
                    <div
                        className="rounded-[10px] p-4 flex-1"
                        style={{
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[15px] font-medium leading-tight">
                                    {next.kind === "component"
                                        ? `${next.deadlineTitle} — ${next.title}`
                                        : next.title}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full"
                                        style={{
                                            background: moduleColor(
                                                next.moduleId,
                                            ),
                                        }}
                                    />
                                    <span
                                        className="text-[12px]"
                                        style={{ color: "var(--text2)" }}
                                    >
                                        {moduleName ?? "Unlinked"}
                                    </span>
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                                        style={{
                                            background: "var(--bg4)",
                                            color: "var(--text2)",
                                        }}
                                    >
                                        {next.kind}
                                    </span>
                                </div>
                            </div>
                            <span
                                className="text-[11px] px-2 py-1 rounded-full font-medium whitespace-nowrap"
                                style={{
                                    background: "var(--accent)" + "20",
                                    color: "var(--accent)",
                                }}
                            >
                                {relativeLabel(next.dueAt)}
                            </span>
                        </div>

                        <div
                            className="text-[12px] mt-3 font-mono"
                            style={{
                                color: "var(--text2)",
                                fontFamily: "var(--font-dm-mono)",
                            }}
                        >
                            {new Date(next.dueAt).toLocaleString(undefined, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>

                    <Link
                        href={timelineHref}
                        className="gt-btn-ghost mt-3 justify-center"
                    >
                        View on timeline <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <div className="text-[28px] mb-2">✓</div>
                    <div
                        className="text-[13px]"
                        style={{ color: "var(--text2)" }}
                    >
                        No upcoming deadlines
                    </div>
                    <Link
                        href="/timeline"
                        className="gt-btn-ghost mt-4 justify-center"
                    >
                        Open timeline <ArrowRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
}
