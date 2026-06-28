"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";
import { LETTER_GRADES } from "@/lib/gradeUtils";
import { AssessmentType, GradeType, Milestone } from "@/lib/types";
import { Overlay, Field, ModalFooter } from "./AddModuleModal";

interface Props {
    moduleId: string;
    usedWeight: number;
    onClose: () => void;
}

type MilestoneDraft = {
    id: string;
    title: string;
    dueDate: string;
    weight: string;
};

function createEmptyMilestone(): MilestoneDraft {
    return { id: crypto.randomUUID(), title: "", dueDate: "", weight: "" };
}

export default function AddAssessmentModal({
    moduleId,
    usedWeight,
    onClose,
}: Props) {
    const addAssessment = useAcademicStore((s) => s.addAssessment);
    const [name, setName] = useState("");
    const [type, setType] = useState<AssessmentType>("coursework");
    const [weight, setWeight] = useState("");

    // Timeline dates — the module/assessment record is the source of truth.
    const [examDate, setExamDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [milestones, setMilestones] = useState<MilestoneDraft[]>([
        createEmptyMilestone(),
    ]);

    const [gradeMode, setGradeMode] = useState<"letter" | "pct">("letter");
    const [letter, setLetter] = useState("");
    const [pct, setPct] = useState("");
    const [examPct, setExamPct] = useState("");
    const [err, setErr] = useState("");

    function addMilestoneRow() {
        setMilestones((prev) => [...prev, createEmptyMilestone()]);
    }

    function removeMilestoneRow(id: string) {
        setMilestones((prev) => prev.filter((m) => m.id !== id));
    }

    function changeMilestone(
        id: string,
        field: "title" | "dueDate" | "weight",
        value: string,
    ) {
        setMilestones((prev) =>
            prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
        );
    }

    function handleSubmit() {
        if (!name.trim()) {
            setErr("Assessment name required");
            return;
        }
        const w = parseFloat(parseFloat(weight).toFixed(2)); // up to 2dp
        if (isNaN(w) || w <= 0 || w > 100) {
            setErr("Weight must be between 0 and 100");
            return;
        }
        // Small tolerance handles floating point (e.g. 33.33 + 33.33 + 33.34 = 100.00)
        if (usedWeight + w > 100.005) {
            setErr(`Only ${(100 - usedWeight).toFixed(2)}% weight remaining`);
            return;
        }

        let grade: string | number | null = null;
        let gradeType: GradeType | null = null;

        if (type === "coursework") {
            if (gradeMode === "letter" && letter) {
                grade = letter;
                gradeType = "letter";
            } else if (gradeMode === "pct" && pct !== "") {
                const n = parseFloat(pct);
                if (isNaN(n) || n < 0 || n > 100) {
                    setErr("Grade must be 0–100");
                    return;
                }
                grade = n;
                gradeType = "pct";
            }
        } else {
            if (examPct !== "") {
                const n = parseFloat(examPct);
                if (isNaN(n) || n < 0 || n > 100) {
                    setErr("Grade must be 0–100");
                    return;
                }
                grade = n;
                gradeType = "pct";
            }
        }

        // Coursework milestones: keep only fully-specified rows.
        const cleanedMilestones: Milestone[] =
            type === "coursework"
                ? milestones
                      .filter((m) => m.title.trim() !== "" && m.dueDate !== "")
                      .map((m) => ({
                          id: m.id,
                          title: m.title.trim(),
                          dueDate: m.dueDate,
                          weight: m.weight === "" ? 0 : parseFloat(m.weight),
                      }))
                : [];

        void addAssessment(moduleId, {
            name: name.trim(),
            type,
            weight: w,
            grade,
            gradeType,
            examDate: type === "exam" ? examDate || null : null,
            startDate: type === "coursework" ? startDate || null : null,
            dueDate: type === "coursework" ? dueDate || null : null,
            milestones: cleanedMilestones,
        });
        onClose();
    }

    return (
        <Overlay onClose={onClose}>
            <h2 className="text-[16px] font-semibold mb-5">Add Assessment</h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Assessment Name">
                    <input
                        className="gt-input"
                        placeholder="e.g. Coursework 1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Field>
                <Field label="Type">
                    <select
                        className="gt-input"
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value as AssessmentType)
                        }
                    >
                        <option value="coursework">Coursework</option>
                        <option value="exam">Exam</option>
                    </select>
                </Field>
            </div>

            <Field label="Weight in Module (%)">
                <input
                    className="gt-input"
                    type="number"
                    placeholder="33.33"
                    step="0.01"
                    min={0.01}
                    max={100}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                />
            </Field>

            {/* Timeline dates — drives the read-only Gantt timeline */}
            <div
                className="mt-4 rounded-[10px] p-4"
                style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                }}
            >
                <div
                    className="text-[11px] uppercase tracking-[0.06em] mb-3"
                    style={{ color: "var(--text3)" }}
                >
                    Timeline dates
                </div>

                {type === "exam" ? (
                    <Field label="Exam Date">
                        <input
                            className="gt-input"
                            type="datetime-local"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                        />
                    </Field>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Start Date (optional)">
                                <input
                                    className="gt-input"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="Final Due Date">
                                <input
                                    className="gt-input"
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </Field>
                        </div>

                        {/* Milestones / sub-components */}
                        <div className="mt-1">
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className="text-[11px] uppercase tracking-[0.06em]"
                                    style={{ color: "var(--text3)" }}
                                >
                                    Milestones (optional)
                                </span>
                                <button
                                    type="button"
                                    onClick={addMilestoneRow}
                                    className="gt-btn-ghost gt-btn-sm"
                                >
                                    <Plus size={12} /> Add milestone
                                </button>
                            </div>

                            <div className="space-y-2">
                                {milestones.map((m, index) => (
                                    <div
                                        key={m.id}
                                        className="flex items-end gap-2 rounded-[10px] p-2.5"
                                        style={{
                                            background: "var(--bg2)",
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        <div className="flex-1">
                                            <label
                                                className="block text-[10px] uppercase tracking-[0.06em] mb-1"
                                                style={{ color: "var(--text3)" }}
                                            >
                                                Title
                                            </label>
                                            <input
                                                className="gt-input"
                                                placeholder={
                                                    index === 0
                                                        ? "e.g. Proposal"
                                                        : "e.g. Draft"
                                                }
                                                value={m.title}
                                                onChange={(e) =>
                                                    changeMilestone(
                                                        m.id,
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label
                                                className="block text-[10px] uppercase tracking-[0.06em] mb-1"
                                                style={{ color: "var(--text3)" }}
                                            >
                                                Due Date
                                            </label>
                                            <input
                                                className="gt-input"
                                                type="datetime-local"
                                                value={m.dueDate}
                                                onChange={(e) =>
                                                    changeMilestone(
                                                        m.id,
                                                        "dueDate",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-[78px]">
                                            <label
                                                className="block text-[10px] uppercase tracking-[0.06em] mb-1"
                                                style={{ color: "var(--text3)" }}
                                            >
                                                Weight
                                            </label>
                                            <input
                                                className="gt-input"
                                                type="number"
                                                placeholder="%"
                                                min={0}
                                                max={100}
                                                step={0.1}
                                                value={m.weight}
                                                onChange={(e) =>
                                                    changeMilestone(
                                                        m.id,
                                                        "weight",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeMilestoneRow(m.id)
                                            }
                                            disabled={milestones.length === 1}
                                            aria-label="Remove milestone"
                                            className="gt-btn-danger gt-btn-sm mb-[1px]"
                                            style={{
                                                opacity:
                                                    milestones.length === 1
                                                        ? 0.3
                                                        : 1,
                                            }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p
                                className="text-[11px] mt-2"
                                style={{ color: "var(--text3)" }}
                            >
                                Milestone weights are a planning breakdown of
                                this coursework and don&apos;t affect the module
                                aggregation, which uses the assessment weight
                                above.
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4">
                <label
                    className="block text-[11px] uppercase tracking-[0.06em] mb-2"
                    style={{ color: "var(--text3)" }}
                >
                    Grade (leave empty if not yet received)
                </label>

                {type === "coursework" ? (
                    <>
                        {/* Toggle */}
                        <div className="flex gap-2 mb-3">
                            {(["letter", "pct"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setGradeMode(mode)}
                                    className="flex-1 py-2 rounded-lg text-[12px] transition-colors border"
                                    style={{
                                        background:
                                            gradeMode === mode
                                                ? "var(--accent)"
                                                : "var(--bg3)",
                                        borderColor:
                                            gradeMode === mode
                                                ? "var(--accent)"
                                                : "var(--border)",
                                        color:
                                            gradeMode === mode
                                                ? "#fff"
                                                : "var(--text2)",
                                    }}
                                >
                                    {mode === "letter"
                                        ? "Letter grade"
                                        : "Percentage"}
                                </button>
                            ))}
                        </div>

                        {gradeMode === "letter" ? (
                            <select
                                className="gt-input"
                                value={letter}
                                onChange={(e) => setLetter(e.target.value)}
                            >
                                <option value="">— not yet received —</option>
                                {Object.entries(LETTER_GRADES).map(
                                    ([l, { range }]) => (
                                        <option key={l} value={l}>
                                            {l} ({range})
                                        </option>
                                    ),
                                )}
                            </select>
                        ) : (
                            <>
                                <input
                                    className="gt-input"
                                    type="number"
                                    placeholder="e.g. 72.5"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={pct}
                                    onChange={(e) => setPct(e.target.value)}
                                />
                                <p
                                    className="text-[11px] mt-1.5"
                                    style={{ color: "var(--text3)" }}
                                >
                                    Decimals are allowed — converted to an
                                    aggregation score by interpolation, matching
                                    the portal.
                                </p>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <input
                            className="gt-input"
                            type="number"
                            placeholder="e.g. 65.5"
                            min={0}
                            max={100}
                            step={0.1}
                            value={examPct}
                            onChange={(e) => setExamPct(e.target.value)}
                        />
                        <p
                            className="text-[11px] mt-1.5"
                            style={{ color: "var(--text3)" }}
                        >
                            Decimals are allowed — converted to an aggregation
                            score by interpolation, matching the portal.
                        </p>
                    </>
                )}
            </div>

            {err && (
                <p className="text-[11px] mt-2" style={{ color: "var(--red)" }}>
                    {err}
                </p>
            )}
            <ModalFooter
                onCancel={onClose}
                onConfirm={handleSubmit}
                confirmLabel="Add Assessment"
            />
        </Overlay>
    );
}
