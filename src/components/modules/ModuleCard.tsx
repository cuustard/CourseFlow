"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import { Module } from "@/lib/types";
import {
    calcModuleAgg,
    assessmentAgg,
    getClassification,
} from "@/lib/gradeUtils";
import { useAcademicStore } from "@/store/useAcademicStore";
import AddAssessmentModal from "./AddAssessmentModal";
import EnterGradeModal from "./EnterGradeModal";

interface Props {
    module: Module;
}

export default function ModuleCard({ module }: Props) {
    const [open, setOpen] = useState(false);
    const [showAddAss, setShowAddAss] = useState(false);
    const [enteringGradeFor, setEnteringGradeFor] = useState<string | null>(
        null,
    );
    const removeModule = useAcademicStore((s) => s.removeModule);
    const removeAssessment = useAcademicStore((s) => s.removeAssessment);
    const updateGrade = useAcademicStore((s) => s.updateAssessmentGrade);

    const r = calcModuleAgg(module);
    const cls =
        r && r.weightDone === 100 ? getClassification(r.effectiveAgg) : null;
    const totalWeight =
        Math.round(
            module.assessments.reduce((s, a) => s + a.weight, 0) * 100,
        ) / 100;
    const pctDone = r ? r.weightDone : 0;

    function handleEnterGrade(assId: string) {
        setEnteringGradeFor(assId);
    }

    return (
        <>
            <div
                className="rounded-[10px] mb-3 overflow-hidden"
                style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg2)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors"
                    style={{ background: open ? "var(--bg3)" : undefined }}
                    onClick={() => setOpen(!open)}
                >
                    <div>
                        <div className="text-[14px] font-medium">
                            {module.name}
                        </div>
                        <div
                            className="text-[12px] mt-0.5"
                            style={{ color: "var(--text2)" }}
                        >
                            {module.credits} credits
                            {cls && (
                                <span
                                    className={`ml-2 badge-${cls.cls} badge`}
                                >
                                    {cls.label}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div
                                className="text-[18px] font-semibold font-mono"
                                style={{
                                    color: r ? "var(--accent)" : "var(--text3)",
                                    fontFamily: "var(--font-dm-mono)",
                                }}
                            >
                                {r ? r.effectiveAgg.toFixed(2) : "—"}
                            </div>
                            <div
                                className="text-[11px]"
                                style={{ color: "var(--text3)" }}
                            >
                                {pctDone}% weighted
                            </div>
                        </div>
                        {open ? (
                            <ChevronUp size={16} color="var(--text3)" />
                        ) : (
                            <ChevronDown size={16} color="var(--text3)" />
                        )}
                    </div>
                </div>

                {/* Body */}
                {open && (
                    <div
                        className="px-5 pb-5"
                        style={{ borderTop: "1px solid var(--border)" }}
                    >
                        {/* Progress bar */}
                        <div
                            className="mt-3 mb-3 h-1.5 rounded-full"
                            style={{ background: "var(--bg3)" }}
                        >
                            <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                    width: `${pctDone}%`,
                                    background:
                                        pctDone === 100
                                            ? "var(--green)"
                                            : "var(--accent)",
                                }}
                            />
                        </div>

                        {/* Weight warning */}
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className="text-[12px]"
                                style={{ color: "var(--text2)" }}
                            >
                                Assessments
                                {totalWeight > 100.005 && (
                                    <span
                                        className="ml-2 text-[11px]"
                                        style={{ color: "var(--red)" }}
                                    >
                                        ⚠ Weights exceed 100%
                                    </span>
                                )}
                                {totalWeight < 99.995 && totalWeight > 0 && (
                                    <span
                                        className="ml-2 text-[11px]"
                                        style={{ color: "var(--amber)" }}
                                    >
                                        {(100 - totalWeight).toFixed(2)}%
                                        unassigned
                                    </span>
                                )}
                            </div>
                            <button
                                className="gt-btn-primary gt-btn-sm"
                                onClick={() => setShowAddAss(true)}
                            >
                                <Plus size={12} /> Add Assessment
                            </button>
                        </div>

                        {module.assessments.length === 0 ? (
                            <div
                                className="text-center py-6 text-[12px]"
                                style={{ color: "var(--text3)" }}
                            >
                                No assessments yet
                            </div>
                        ) : (
                            <table className="w-full text-[13px] border-collapse">
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {[
                                            "Name",
                                            "Type",
                                            "Weight",
                                            "Grade",
                                            "Agg",
                                            "Status",
                                            "",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left py-2 px-3 text-[11px] uppercase tracking-[0.06em]"
                                                style={{ color: "var(--text3)" }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {module.assessments.map((a) => {
                                        const ag = assessmentAgg(a);
                                        return (
                                            <tr
                                                key={a.id}
                                                className="transition-colors"
                                                style={{
                                                    borderBottom:
                                                        "1px solid var(--border)",
                                                }}
                                            >
                                                <td className="py-2.5 px-3">
                                                    {a.name}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                                                            a.type === "exam"
                                                                ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
                                                                : "text-purple-400 border-purple-400/30 bg-purple-400/10"
                                                        }`}
                                                    >
                                                        {a.type === "exam"
                                                            ? "Exam"
                                                            : "Coursework"}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span
                                                        className="text-[11px] px-2 py-0.5 rounded-md"
                                                        style={{
                                                            background:
                                                                "var(--bg3)",
                                                            border: "1px solid var(--border)",
                                                            color: "var(--text2)",
                                                        }}
                                                    >
                                                        {a.weight}%
                                                    </span>
                                                </td>
                                                <td
                                                    className="py-2.5 px-3 font-mono text-[13px]"
                                                    style={{
                                                        fontFamily:
                                                            "var(--font-dm-mono)",
                                                    }}
                                                >
                                                    {a.grade !== null ? (
                                                        a.gradeType ===
                                                        "letter" ? (
                                                            String(a.grade)
                                                        ) : (
                                                            `${a.grade}%`
                                                        )
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: "var(--text3)",
                                                            }}
                                                        >
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    className="py-2.5 px-3 font-mono"
                                                    style={{
                                                        color:
                                                            ag !== null
                                                                ? "var(--accent)"
                                                                : "var(--text3)",
                                                        fontFamily:
                                                            "var(--font-dm-mono)",
                                                    }}
                                                >
                                                    {ag !== null
                                                        ? ag.toFixed(1)
                                                        : "—"}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span
                                                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                            a.grade !== null
                                                                ? "badge-done badge"
                                                                : "badge-pending badge"
                                                        }`}
                                                    >
                                                        {a.grade !== null
                                                            ? "Received"
                                                            : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-1">
                                                        {a.grade === null && (
                                                            <button
                                                                className="gt-btn-ghost gt-btn-sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEnterGrade(
                                                                        a.id,
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil
                                                                    size={11}
                                                                />{" "}
                                                                Grade
                                                            </button>
                                                        )}
                                                        <button
                                                            className="gt-btn-danger gt-btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    confirm(
                                                                        `Remove "${a.name}"?`,
                                                                    )
                                                                )
                                                                    void removeAssessment(
                                                                        module.id,
                                                                        a.id,
                                                                    );
                                                            }}
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        <div
                            className="flex justify-end mt-3 pt-3"
                            style={{ borderTop: "1px solid var(--border)" }}
                        >
                            <button
                                className="gt-btn-danger gt-btn-sm"
                                onClick={() => {
                                    if (confirm("Remove module?"))
                                        void removeModule(module.id);
                                }}
                            >
                                <Trash2 size={11} /> Remove Module
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showAddAss && (
                <AddAssessmentModal
                    moduleId={module.id}
                    usedWeight={totalWeight}
                    onClose={() => setShowAddAss(false)}
                />
            )}

            {enteringGradeFor &&
                (() => {
                    const a = module.assessments.find(
                        (x) => x.id === enteringGradeFor,
                    );
                    if (!a) return null;
                    return (
                        <EnterGradeModal
                            assessment={a}
                            onConfirm={(grade, gradeType) =>
                                void updateGrade(
                                    module.id,
                                    enteringGradeFor,
                                    grade,
                                    gradeType,
                                )
                            }
                            onClose={() => setEnteringGradeFor(null)}
                        />
                    );
                })()}

            <style jsx>{`
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .badge-first {
                    background: #7c6ee020;
                    color: var(--accent);
                }
                .badge-two1 {
                    background: #3a7bd520;
                    color: var(--blue);
                }
                .badge-two2 {
                    background: #3d997020;
                    color: var(--green);
                }
                .badge-third {
                    background: #d4843a20;
                    color: var(--amber);
                }
                .badge-fail {
                    background: #c0392b20;
                    color: var(--red);
                }
                .badge-done {
                    background: #3d997020;
                    color: var(--green);
                }
                .badge-pending {
                    background: #2a2a2f;
                    color: var(--text2);
                }
            `}</style>
        </>
    );
}
