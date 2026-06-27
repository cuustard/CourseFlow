"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";
import ModuleCard from "./ModuleCard";
import AddModuleModal from "./AddModuleModal";

export default function ModuleList() {
    const modules = useAcademicStore((s) => s.modules);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-8">
            <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                Modules
            </h1>
            <p className="text-[13px] mb-7" style={{ color: "var(--text2)" }}>
                Grades are converted to aggregation scores automatically.
            </p>

            <div className="mb-5">
                <button
                    className="gt-btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={14} /> Add Module
                </button>
            </div>

            {modules.length === 0 ? (
                <div
                    className="text-center py-16"
                    style={{ color: "var(--text2)" }}
                >
                    <div className="text-[32px] mb-3">📚</div>
                    <div>No modules yet</div>
                    <div
                        className="text-[12px] mt-1.5"
                        style={{ color: "var(--text3)" }}
                    >
                        Add your first module to get started
                    </div>
                </div>
            ) : (
                modules.map((m) => <ModuleCard key={m.id} module={m} />)
            )}

            {showModal && <AddModuleModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
