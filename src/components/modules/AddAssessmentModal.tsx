"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/useAcademicStore";
import { LETTER_GRADES } from "@/lib/gradeUtils";
import { AssessmentType, GradeType } from "@/lib/types";
import { Overlay, Field, ModalFooter } from "./AddModuleModal";

interface Props {
    moduleId: string;
    usedWeight: number;
    onClose: () => void;
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
    const [gradeMode, setGradeMode] = useState<"letter" | "pct">("letter");
    const [letter, setLetter] = useState("");
    const [pct, setPct] = useState("");
    const [examPct, setExamPct] = useState("");
    const [err, setErr] = useState("");

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

        void addAssessment(moduleId, {
            name: name.trim(),
            type,
            weight: w,
            grade,
            gradeType,
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
