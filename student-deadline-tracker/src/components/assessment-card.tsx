import type { Assessment, Module } from "@/types";
import ModuleBadge from "./module-badge";
import {
    getAssessmentRelevantDate,
    getDaysUntil,
} from "@/lib/assessment-helpers";

type AssessmentCardProps = {
    assessment: Assessment;
    moduleData?: Module;
};

function isSoon(date: string) {
    return getDaysUntil(date) <= 3;
}

export default function AssessmentCard({
    assessment,
    moduleData,
}: AssessmentCardProps) {
    const relevantDate = getAssessmentRelevantDate(assessment);
    const showingComponentUrgency = relevantDate !== assessment.dueAt;

    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
                isSoon(relevantDate) ? "border-red-500" : "border-slate-200"
            }`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">
                            {assessment.title}
                        </h2>

                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                            {assessment.type}
                        </span>
                    </div>

                    {moduleData && (
                        <ModuleBadge
                            name={moduleData.name}
                            color={moduleData.color}
                        />
                    )}

                    {showingComponentUrgency && (
                        <p className="text-sm font-medium text-amber-700">
                            Nearest component deadline:{" "}
                            {new Date(relevantDate).toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="text-sm text-slate-600 sm:text-right">
                    <p className="font-medium">Main due date</p>
                    <p>{new Date(assessment.dueAt).toLocaleString()}</p>
                </div>
            </div>

            {assessment.components && assessment.components.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                        Components
                    </p>

                    <div className="space-y-2">
                        {assessment.components.map((component) => (
                            <div
                                key={component.id}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                            >
                                <span>{component.title}</span>
                                <span className="text-slate-500">
                                    {new Date(component.dueAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
