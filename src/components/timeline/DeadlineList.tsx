"use client";

import { Check, Trash2 } from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";
import { relativeLabel } from "@/lib/timelineUtils";
import { moduleColor } from "@/lib/moduleColors";
import type { Deadline, Module } from "@/lib/types";
import ModuleBadge from "./ModuleBadge";

type DeadlineListProps = {
    deadlines: Deadline[];
    modules: Module[];
};

export default function DeadlineList({ deadlines, modules }: DeadlineListProps) {
    const toggleSubComponent = useAcademicStore((s) => s.toggleSubComponent);
    const removeDeadline = useAcademicStore((s) => s.removeDeadline);

    if (deadlines.length === 0) return null;

    return (
        <section className="mt-5">
            <h2 className="text-[16px] font-medium mb-3 tracking-tight">
                Deadline details
            </h2>

            <div className="space-y-3">
                {deadlines.map((d) => {
                    const moduleData = modules.find((m) => m.id === d.moduleId);
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
                                        {moduleData && (
                                            <ModuleBadge
                                                name={moduleData.name}
                                                color={color}
                                            />
                                        )}
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

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Remove "${d.title}" from your timeline?`,
                                            )
                                        )
                                            void removeDeadline(d.id);
                                    }}
                                    className="gt-btn-danger gt-btn-sm shrink-0"
                                    aria-label={`Remove ${d.title}`}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>

                            {/* Sub-component completion toggles */}
                            {d.subComponents.length > 0 && (
                                <div
                                    className="mt-3 pt-3 flex flex-wrap gap-2"
                                    style={{
                                        borderTop: "1px solid var(--border)",
                                    }}
                                >
                                    {d.subComponents.map((sub) => (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() =>
                                                void toggleSubComponent(
                                                    d.id,
                                                    sub.id,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-colors"
                                            style={{
                                                background: sub.isCompleted
                                                    ? "var(--green)" + "20"
                                                    : "var(--bg3)",
                                                border: `1px solid ${
                                                    sub.isCompleted
                                                        ? "var(--green)" + "50"
                                                        : "var(--border)"
                                                }`,
                                                color: sub.isCompleted
                                                    ? "var(--green)"
                                                    : "var(--text2)",
                                            }}
                                            title={
                                                sub.isCompleted
                                                    ? "Mark as not done"
                                                    : "Mark as done"
                                            }
                                        >
                                            <span
                                                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
                                                style={{
                                                    border: `1px solid ${
                                                        sub.isCompleted
                                                            ? "var(--green)"
                                                            : "var(--border2)"
                                                    }`,
                                                    background: sub.isCompleted
                                                        ? "var(--green)"
                                                        : "transparent",
                                                }}
                                            >
                                                {sub.isCompleted && (
                                                    <Check
                                                        size={9}
                                                        color="#fff"
                                                    />
                                                )}
                                            </span>
                                            <span
                                                style={{
                                                    textDecoration:
                                                        sub.isCompleted
                                                            ? "line-through"
                                                            : "none",
                                                }}
                                            >
                                                {sub.title}
                                            </span>
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
                                        </button>
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
