"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/useAcademicStore";

interface Props {
    onClose: () => void;
}

export default function AddModuleModal({ onClose }: Props) {
    const addModule = useAcademicStore((s) => s.addModule);
    const [name, setName] = useState("");
    const [credits, setCredits] = useState("");
    const [err, setErr] = useState("");

    function handleSubmit() {
        if (!name.trim()) {
            setErr("Module name required");
            return;
        }
        const c = parseInt(credits);
        if (!c || c < 1) {
            setErr("Valid credit value required");
            return;
        }
        void addModule(name.trim(), c);
        onClose();
    }

    return (
        <Overlay onClose={onClose}>
            <h2 className="text-[16px] font-semibold mb-5">Add Module</h2>
            <Field label="Module Name">
                <input
                    className="gt-input"
                    placeholder="e.g. Database Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Field>
            <Field label="Credit Value">
                <input
                    className="gt-input"
                    type="number"
                    placeholder="15"
                    min={1}
                    max={120}
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                />
            </Field>
            {err && (
                <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>
                    {err}
                </p>
            )}
            <ModalFooter
                onCancel={onClose}
                onConfirm={handleSubmit}
                confirmLabel="Add Module"
            />
        </Overlay>
    );
}

// ── Shared modal primitives (used by both modals)
export function Overlay({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={onClose}
        >
            <div
                className="rounded-xl p-6 w-[480px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
                style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-3">
            <label
                className="block text-[11px] uppercase tracking-[0.06em] mb-1"
                style={{ color: "var(--text3)" }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}

export function ModalFooter({
    onCancel,
    onConfirm,
    confirmLabel,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    confirmLabel: string;
}) {
    return (
        <div
            className="flex justify-end gap-2 mt-5 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
        >
            <button className="gt-btn-ghost" onClick={onCancel}>
                Cancel
            </button>
            <button className="gt-btn-primary" onClick={onConfirm}>
                {confirmLabel}
            </button>
        </div>
    );
}
