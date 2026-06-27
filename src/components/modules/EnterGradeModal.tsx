"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { LETTER_GRADES } from "@/lib/gradeUtils";
import { Overlay, Field, ModalFooter } from "./AddModuleModal";

interface Props {
    assessment: Assessment;
    onConfirm: (grade: string | number, gradeType: "letter" | "pct") => void;
    onClose: () => void;
}

export default function EnterGradeModal({
    assessment,
    onConfirm,
    onClose,
}: Props) {
    const isCoursework = assessment.type === "coursework";
    const [gradeMode, setGradeMode] = useState<"letter" | "pct">(
        isCoursework ? "letter" : "pct",
    );
    const [letter, setLetter] = useState("");
    const [pct, setPct] = useState("");
    const [err, setErr] = useState("");

    function handleConfirm() {
        setErr("");
        if (gradeMode === "letter") {
            if (!letter) {
                setErr("Please select a grade");
                return;
            }
            onConfirm(letter, "letter");
        } else {
            const n = parseFloat(pct);
            if (isNaN(n) || n < 0 || n > 100) {
                setErr("Enter a valid percentage between 0 and 100");
                return;
            }
            onConfirm(n, "pct");
        }
        onClose();
    }

    return (
        <Overlay onClose={onClose}>
            <h2 className="text-[16px] font-semibold mb-1">Enter Grade</h2>
            <p className="text-[12px] mb-5" style={{ color: "var(--text2)" }}>
                {assessment.name}
            </p>

            {isCoursework && (
                <div className="flex gap-2 mb-4">
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
                                    gradeMode === mode ? "#fff" : "var(--text2)",
                            }}
                        >
                            {mode === "letter" ? "Letter grade" : "Percentage"}
                        </button>
                    ))}
                </div>
            )}

            {gradeMode === "letter" ? (
                <Field label="Letter Grade">
                    <select
                        className="gt-input"
                        value={letter}
                        onChange={(e) => setLetter(e.target.value)}
                    >
                        <option value="">— select grade —</option>
                        {Object.entries(LETTER_GRADES).map(
                            ([l, { range }]) => (
                                <option key={l} value={l}>
                                    {l} ({range})
                                </option>
                            ),
                        )}
                    </select>
                </Field>
            ) : (
                <Field label="Percentage (0–100)">
                    <input
                        className="gt-input"
                        type="number"
                        placeholder="e.g. 72.5"
                        step="0.1"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={(e) => setPct(e.target.value)}
                        autoFocus
                    />
                </Field>
            )}

            {err && (
                <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>
                    {err}
                </p>
            )}

            <ModalFooter
                onCancel={onClose}
                onConfirm={handleConfirm}
                confirmLabel="Save Grade"
            />
        </Overlay>
    );
}
