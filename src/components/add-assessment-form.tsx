"use client";

import { useState } from "react";
import type { Assessment, AssessmentType, Module } from "@/types";

type AddAssessmentFormProps = {
    modules: Module[];
    onAddAssessment: (assessment: Assessment) => void;
    onClose: () => void;
};

type ComponentDraft = {
    id: string;
    title: string;
    dueAt: string;
};

function createEmptyComponent(): ComponentDraft {
    return {
        id: crypto.randomUUID(),
        title: "",
        dueAt: "",
    };
}

function TrashIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export default function AddAssessmentForm({
    modules,
    onAddAssessment,
    onClose,
}: AddAssessmentFormProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<AssessmentType>("coursework");
    const [moduleId, setModuleId] = useState(modules[0]?.id ?? "");
    const [dueAt, setDueAt] = useState("");
    const [components, setComponents] = useState<ComponentDraft[]>([
        createEmptyComponent(),
    ]);
    const [error, setError] = useState("");

    function handleAddComponentRow() {
        setComponents((prev) => [...prev, createEmptyComponent()]);
    }

    function handleRemoveComponentRow(id: string) {
        setComponents((prev) =>
            prev.filter((component) => component.id !== id)
        );
    }

    function handleComponentChange(
        id: string,
        field: "title" | "dueAt",
        value: string
    ) {
        setComponents((prev) =>
            prev.map((component) =>
                component.id === id
                    ? { ...component, [field]: value }
                    : component
            )
        );
    }

    function resetForm() {
        setTitle("");
        setType("coursework");
        setModuleId(modules[0]?.id ?? "");
        setDueAt("");
        setComponents([createEmptyComponent()]);
        setError("");
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!title.trim()) {
            setError("Please enter a title.");
            return;
        }
        if (!moduleId) {
            setError("Please select a module.");
            return;
        }
        if (!dueAt) {
            setError("Please set a due date.");
            return;
        }

        setError("");

        const cleanedComponents =
            type === "coursework"
                ? components
                      .filter(
                          (c) => c.title.trim() !== "" && c.dueAt !== ""
                      )
                      .map((c) => ({
                          id: c.id,
                          title: c.title.trim(),
                          dueAt: c.dueAt,
                      }))
                : [];

        onAddAssessment({
            id: crypto.randomUUID(),
            title: title.trim(),
            type,
            moduleId,
            dueAt,
            components: cleanedComponents,
        });
        resetForm();
    }

    const showComponents = type === "coursework";

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Card header — title + close button */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Add Assessment
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Add an exam or coursework with optional components.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close form"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <CloseIcon />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="title"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. AI Coursework Report"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="type"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Type
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) =>
                                setType(e.target.value as AssessmentType)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        >
                            <option value="coursework">Coursework</option>
                            <option value="exam">Exam</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="module"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Module
                        </label>
                        <select
                            id="module"
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        >
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="dueAt"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Main due date and time
                        </label>
                        <input
                            id="dueAt"
                            type="datetime-local"
                            value={dueAt}
                            onChange={(e) => setDueAt(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                    </div>
                </div>

                {showComponents && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Coursework Components
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Draft, presentation, final submission, etc.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddComponentRow}
                                className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                + Add component
                            </button>
                        </div>

                        <div className="mt-3 space-y-3">
                            {components.map((component, index) => (
                                <div
                                    key={component.id}
                                    className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                                >
                                    <div className="flex-1">
                                        <label
                                            htmlFor={`component-title-${component.id}`}
                                            className="mb-1.5 block text-xs font-medium text-slate-600"
                                        >
                                            Title
                                        </label>
                                        <input
                                            id={`component-title-${component.id}`}
                                            type="text"
                                            value={component.title}
                                            onChange={(e) =>
                                                handleComponentChange(
                                                    component.id,
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                index === 0
                                                    ? "e.g. Draft submission"
                                                    : "e.g. Presentation"
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label
                                            htmlFor={`component-due-${component.id}`}
                                            className="mb-1.5 block text-xs font-medium text-slate-600"
                                        >
                                            Due date
                                        </label>
                                        <input
                                            id={`component-due-${component.id}`}
                                            type="datetime-local"
                                            value={component.dueAt}
                                            onChange={(e) =>
                                                handleComponentChange(
                                                    component.id,
                                                    "dueAt",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                        />
                                    </div>

                                    {/* Trash icon — aligns with input bottom edge */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveComponentRow(
                                                component.id
                                            )
                                        }
                                        disabled={components.length === 1}
                                        aria-label="Remove component"
                                        className="mb-[1px] rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                        Add assessment
                    </button>

                    {error && (
                        <p
                            className="text-sm font-medium text-red-600"
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
