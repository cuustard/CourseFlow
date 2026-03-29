import { modules } from "@/data/mock-data";
import { getDaysUntil } from "@/lib/assessment-helpers";
import type { TimelineItem } from "@/types";
import ModuleBadge from "./module-badge";

type TimelineListProps = {
    items: TimelineItem[];
};

function getTimelineStatusLabel(dueAt: string) {
    const daysUntil = getDaysUntil(dueAt);

    if (daysUntil < 0) return "Overdue";
    if (daysUntil <= 1) return "Due soon";
    if (daysUntil <= 7) return "This week";
    return "Later";
}

export default function TimelineList({ items }: TimelineListProps) {
    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Timeline</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Every exam and coursework component in chronological
                        order.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    {items.length} item{items.length === 1 ? "" : "s"}
                </span>
            </div>

            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => {
                        const moduleData = modules.find(
                            (m) => m.id === item.moduleId
                        );
                        const isComponent = item.kind === "component";

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-semibold text-slate-900">
                                                {isComponent
                                                    ? `${item.assessmentTitle} — ${item.title}`
                                                    : item.title}
                                            </h3>

                                            <span className="rounded-md bg-white px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                                                {item.kind}
                                            </span>
                                        </div>

                                        {moduleData && (
                                            <ModuleBadge
                                                name={moduleData.name}
                                                color={moduleData.color}
                                            />
                                        )}

                                        <p className="text-sm text-slate-600">
                                            {getTimelineStatusLabel(item.dueAt)}
                                        </p>
                                    </div>

                                    <div className="text-sm text-slate-600 sm:text-right">
                                        <p className="font-medium">Due</p>
                                        <p>
                                            {new Date(
                                                item.dueAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No timeline items to show.
                </div>
            )}
        </section>
    );
}
