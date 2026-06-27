import type { Deadline, TimelineMoment } from "./types";

export function getDaysUntil(iso: string): number {
    return (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

/**
 * Expand deadlines into individual timeline moments: each exam/simple
 * coursework becomes one moment, while coursework with subComponents yields
 * one moment per subComponent. Sorted chronologically.
 */
export function flattenDeadlines(deadlines: Deadline[]): TimelineMoment[] {
    const moments: TimelineMoment[] = [];

    for (const d of deadlines) {
        if (d.type === "exam") {
            moments.push({
                id: `exam-${d.id}`,
                deadlineId: d.id,
                moduleId: d.moduleId,
                deadlineTitle: d.title,
                title: d.title,
                dueAt: d.endDate,
                kind: "exam",
                isCompleted: false,
            });
            continue;
        }

        if (d.subComponents.length > 0) {
            for (const sub of d.subComponents) {
                moments.push({
                    id: `component-${sub.id}`,
                    deadlineId: d.id,
                    moduleId: d.moduleId,
                    deadlineTitle: d.title,
                    title: sub.title,
                    dueAt: sub.dueDate,
                    kind: "component",
                    isCompleted: sub.isCompleted,
                });
            }
        } else {
            moments.push({
                id: `coursework-${d.id}`,
                deadlineId: d.id,
                moduleId: d.moduleId,
                deadlineTitle: d.title,
                title: d.title,
                dueAt: d.endDate,
                kind: "coursework",
                isCompleted: false,
            });
        }
    }

    return moments.sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
}

/**
 * The single most urgent upcoming, not-yet-completed moment across all
 * deadlines — drives the dashboard's "Next Urgent Academic Deadline" widget.
 */
export function nextUrgentMoment(deadlines: Deadline[]): TimelineMoment | null {
    const now = Date.now();
    return (
        flattenDeadlines(deadlines).find(
            (m) => !m.isCompleted && new Date(m.dueAt).getTime() >= now,
        ) ?? null
    );
}

/** Human-friendly relative label, e.g. "in 3 days", "Today", "Overdue". */
export function relativeLabel(iso: string): string {
    const days = getDaysUntil(iso);
    if (days < 0) return "Overdue";
    const whole = Math.floor(days);
    if (whole === 0) return "Due today";
    if (whole === 1) return "Due tomorrow";
    if (whole <= 7) return `In ${whole} days`;
    if (whole <= 14) return "Next week";
    return `In ${whole} days`;
}
