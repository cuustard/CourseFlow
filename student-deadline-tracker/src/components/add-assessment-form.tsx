"use client";

import { useState } from "react";
import type { Assessment, AssessmentType, Module } from "@/types";

type AddAssessmentFormProps = {
    modules: Module[];
    onAddAssessment: (assessment: Assessment) => void;
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

export default function AddAssessmentForm({
    modules,
    onAddAssessment,
}: AddAssessmentFormProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<AssessmentType>("coursework");
    const [moduleId, setModuleId] = useState(modules[0]?.id ?? "");
    const [dueAt, setDueAt] = useState("");
    const [components, setComponents] = useState<ComponentDraft[]>([
        createEmptyComponent(),
    ]);

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
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!title.trim() || !moduleId || !dueAt) {
            return;
        }

        const cleanedComponents =
            type === "coursework"
                ? components
                      .filter(
                          (component) =>
                              component.title.trim() !== "" &&
                              component.dueAt !== ""
                      )
                      .map((component) => ({
                          id: component.id,
                          title: component.title.trim(),
                          dueAt: new Date(component.dueAt).toISOString(),
                      }))
                : [];

        const newAssessment: Assessment = {
            id: crypto.randomUUID(),
            title: title.trim(),
            type,
            moduleId,
            dueAt: new Date(dueAt).toISOString(),
            components: cleanedComponents,
        };

        onAddAssessment(newAssessment);
        resetForm();
    }

    const showComponents = type === "coursework";

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-semibold">Add Assessment</h2>
            <p className="mt-1 text-sm text-slate-600">
                Add an exam or coursework with optional coursework components.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-medium text-slate-700"
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
                            className="mb-2 block text-sm font-medium text-slate-700"
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
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Module
                        </label>
                        <select
                            id="module"
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        >
                            {modules.map((moduleItem) => (
                                <option
                                    key={moduleItem.id}
                                    value={moduleItem.id}
                                >
                                    {moduleItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="dueAt"
                            className="mb-2 block text-sm font-medium text-slate-700"
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
                                <h3 className="text-base font-semibold text-slate-900">
                                    Coursework Components
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Add draft, presentation, final submission,
                                    or any other parts.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddComponentRow}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Add component
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {components.map((component, index) => (
                                <div
                                    key={component.id}
                                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
                                >
                                    <div>
                                        <label
                                            htmlFor={`component-title-${component.id}`}
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Component title
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

                                    <div>
                                        <label
                                            htmlFor={`component-due-${component.id}`}
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Component due date
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

                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveComponentRow(
                                                    component.id
                                                )
                                            }
                                            disabled={components.length === 1}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                        Add assessment
                    </button>
                </div>
            </form>
        </section>
    );
}
