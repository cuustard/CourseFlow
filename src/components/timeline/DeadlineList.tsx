"use client";

import { relativeLabel } from "@/lib/timelineUtils";
import { moduleColor } from "@/lib/moduleColors";
import type { Deadline } from "@/lib/types";
import ModuleBadge from "./ModuleBadge";

type DeadlineListProps = {
    deadlines: Deadline[];
};

export default function DeadlineList({ deadlines }: DeadlineListProps) {
    if (deadlines.length === 0) return null;

    return (
        <section className="mt-5">
            <h2 className="text-[16px] font-medium mb-3 tracking-tight">
                Deadline details
            </h2>

            <div className="space-y-3">
                {deadlines.map((d) => {
                    const color = moduleColor(d.moduleId);

                    return (
                        <div
                            key={d.id}
                            className="rounded-[10px] p-4"
                            style={{
                                background: "var(--bg2)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-[14px] font-medium">
                                            {d.title}
                                        </h3>
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                                            style={{
                                                background: "var(--bg3)",
                                                color: "var(--text2)",
                                            }}
                                        >
                                            {d.type}
                                        </span>
                                        <ModuleBadge
                                            name={d.moduleName}
                                            color={color}
                                        />
                                    </div>

                                    <div
                                        className="text-[12px]"
                                        style={{ color: "var(--text2)" }}
                                    >
                                        Due{" "}
                                        {new Date(d.endDate).toLocaleString()} ·{" "}
                                        {relativeLabel(d.endDate)}
                                    </div>
                                </div>
                            </div>

                            {/* Milestones — read-only */}
                            {d.subComponents.length > 0 && (
                                <div
                                    className="mt-3 pt-3 flex flex-wrap gap-2"
                                    style={{
                                        borderTop: "1px solid var(--border)",
                                    }}
                                >
                                    {d.subComponents.map((sub) => (
                                        <span
                                            key={sub.id}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                                            style={{
                                                background: "var(--bg3)",
                                                border: "1px solid var(--border)",
                                                color: "var(--text2)",
                                            }}
                                        >
                                            <span
                                                className="inline-block w-1.5 h-1.5 rounded-full"
                                                style={{ background: color }}
                                            />
                                            <span>{sub.title}</span>
                                            {sub.weight > 0 && (
                                                <span
                                                    style={{
                                                        color: "var(--text3)",
                                                    }}
                                                >
                                                    {sub.weight}%
                                                </span>
                                            )}
                                            <span
                                                style={{
                                                    color: "var(--text3)",
                                                }}
                                            >
                                                {new Date(
                                                    sub.dueDate,
                                                ).toLocaleDateString(undefined, {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
