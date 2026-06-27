"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import type {
    AssessmentType,
    Deadline,
    Module,
    SubComponent,
} from "@/lib/types";

type AddDeadlineFormProps = {
    modules: Module[];
    defaultModuleId?: string | null;
    onAddDeadline: (deadline: Omit<Deadline, "id" | "createdAt">) => void;
    onClose: () => void;
};

type SubComponentDraft = {
    id: string;
    title: string;
    dueDate: string;
};

function createEmptySubComponent(): SubComponentDraft {
    return {
        id: crypto.randomUUID(),
        title: "",
        dueDate: "",
    };
}

export default function AddDeadlineForm({
    modules,
    defaultModuleId,
    onAddDeadline,
    onClose,
}: AddDeadlineFormProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<AssessmentType>("coursework");
    const [moduleId, setModuleId] = useState<string>(
        defaultModuleId && defaultModuleId !== "all" ? defaultModuleId : "",
    );
    const [endDate, setEndDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [subComponents, setSubComponents] = useState<SubComponentDraft[]>([
        createEmptySubComponent(),
    ]);
    const [error, setError] = useState("");

    function handleAddRow() {
        setSubComponents((prev) => [...prev, createEmptySubComponent()]);
    }

    function handleRemoveRow(id: string) {
        setSubComponents((prev) => prev.filter((s) => s.id !== id));
    }

    function handleRowChange(
        id: string,
        field: "title" | "dueDate",
        value: string,
    ) {
        setSubComponents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!title.trim()) {
            setError("Please enter a title.");
            return;
        }
        if (!endDate) {
            setError("Please set the main deadline date.");
            return;
        }

        setError("");

        const cleanedSubs: SubComponent[] =
            type === "coursework"
                ? subComponents
                      .filter((s) => s.title.trim() !== "" && s.dueDate !== "")
                      .map((s) => ({
                          id: s.id,
                          title: s.title.trim(),
                          dueDate: s.dueDate,
                          isCompleted: false,
                      }))
                : [];

        // Derive the planning start: explicit value, else earliest sub-component.
        let resolvedStart: string | null = null;
        if (type === "coursework") {
            if (startDate) {
                resolvedStart = startDate;
            } else if (cleanedSubs.length > 0) {
                resolvedStart = [...cleanedSubs].sort(
                    (a, b) =>
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime(),
                )[0].dueDate;
            }
        }

        onAddDeadline({
            title: title.trim(),
            type,
            moduleId: moduleId || null,
            startDate: resolvedStart,
            endDate,
            subComponents: cleanedSubs,
        });
    }

    const showSubComponents = type === "coursework";

    return (
        <section
            className="mb-5 rounded-[10px]"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            {/* Card header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div>
                    <h2 className="text-[15px] font-medium tracking-tight">
                        Add Deadline
                    </h2>
                    <p
                        className="mt-0.5 text-[12px]"
                        style={{ color: "var(--text3)" }}
                    >
                        Add an exam or coursework with optional sub-components.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close form"
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: "var(--text3)" }}
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="deadline-title"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Title
                        </label>
                        <input
                            id="deadline-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. AI Coursework Report"
                            className="gt-input"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="deadline-type"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Type
                        </label>
                        <select
                            id="deadline-type"
                            value={type}
                            onChange={(e) =>
                                setType(e.target.value as AssessmentType)
                            }
                            className="gt-input"
                        >
                            <option value="coursework">Coursework</option>
                            <option value="exam">Exam</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="deadline-module"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Module (optional)
                        </label>
                        <select
                            id="deadline-module"
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            className="gt-input"
                        >
                            <option value="">— none —</option>
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={showSubComponents ? "" : "md:col-span-2"}>
                        <label
                            htmlFor="deadline-end"
                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                            style={{ color: "var(--text3)" }}
                        >
                            Main deadline
                        </label>
                        <input
                            id="deadline-end"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="gt-input"
                        />
                    </div>

                    {showSubComponents && (
                        <div>
                            <label
                                htmlFor="deadline-start"
                                className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                                style={{ color: "var(--text3)" }}
                            >
                                Start date (optional)
                            </label>
                            <input
                                id="deadline-start"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="gt-input"
                            />
                        </div>
                    )}
                </div>

                {showSubComponents && (
                    <div
                        className="rounded-[10px] p-4"
                        style={{
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-[13px] font-medium">
                                    Sub-components
                                </h3>
                                <p
                                    className="mt-0.5 text-[11px]"
                                    style={{ color: "var(--text3)" }}
                                >
                                    Draft, presentation, final submission, etc.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="gt-btn-ghost gt-btn-sm shrink-0"
                            >
                                + Add sub-component
                            </button>
                        </div>

                        <div className="mt-3 space-y-3">
                            {subComponents.map((sub, index) => (
                                <div
                                    key={sub.id}
                                    className="flex items-end gap-3 rounded-[10px] p-3"
                                    style={{
                                        background: "var(--bg2)",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <div className="flex-1">
                                        <label
                                            htmlFor={`sub-title-${sub.id}`}
                                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                                            style={{ color: "var(--text3)" }}
                                        >
                                            Title
                                        </label>
                                        <input
                                            id={`sub-title-${sub.id}`}
                                            type="text"
                                            value={sub.title}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    sub.id,
                                                    "title",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                index === 0
                                                    ? "e.g. Draft submission"
                                                    : "e.g. Presentation"
                                            }
                                            className="gt-input"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label
                                            htmlFor={`sub-due-${sub.id}`}
                                            className="mb-1.5 block text-[11px] uppercase tracking-[0.06em]"
                                            style={{ color: "var(--text3)" }}
                                        >
                                            Due date
                                        </label>
                                        <input
                                            id={`sub-due-${sub.id}`}
                                            type="datetime-local"
                                            value={sub.dueDate}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    sub.id,
                                                    "dueDate",
                                                    e.target.value,
                                                )
                                            }
                                            className="gt-input"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(sub.id)}
                                        disabled={subComponents.length === 1}
                                        aria-label="Remove sub-component"
                                        className="gt-btn-danger gt-btn-sm mb-[1px]"
                                        style={{
                                            opacity:
                                                subComponents.length === 1
                                                    ? 0.3
                                                    : 1,
                                        }}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button type="submit" className="gt-btn-primary">
                        Add deadline
                    </button>

                    {error && (
                        <p
                            className="text-[12px] font-medium"
                            style={{ color: "var(--red)" }}
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
