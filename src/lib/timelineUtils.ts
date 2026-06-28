import type {
    Assessment,
    Deadline,
    Module,
    SubComponent,
    TimelineMoment,
} from "./types";

export function getDaysUntil(iso: string): number {
    return (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

function byDate(a: string, b: string): number {
    return new Date(a).getTime() - new Date(b).getTime();
}

/**
 * Project a single assessment onto a timeline Deadline, or return null if it
 * carries no usable date yet. This is the one place that maps the grade model
 * onto the Gantt model.
 *
 *   exam       → a point marker at examDate
 *   coursework → a bar from startDate (or earliest milestone) to the final due
 *                date (or latest milestone), with milestone markers in between
 */
function assessmentToDeadline(mod: Module, a: Assessment): Deadline | null {
    if (a.type === "exam") {
        if (!a.examDate) return null;
        return {
            id: `${mod.id}:${a.id}`,
            assessmentId: a.id,
            moduleId: mod.id,
            moduleName: mod.name,
            title: a.name,
            type: "exam",
            startDate: null,
            endDate: a.examDate,
            subComponents: [],
        };
    }

    const subComponents: SubComponent[] = [...a.milestones]
        .sort((m1, m2) => byDate(m1.dueDate, m2.dueDate))
        .map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate,
            weight: m.weight,
        }));

    // Final due: explicit dueDate, else the latest milestone. No date → skip.
    const endDate =
        a.dueDate ??
        (subComponents.length
            ? subComponents[subComponents.length - 1].dueDate
            : null);
    if (!endDate) return null;

    const startDate =
        a.startDate ?? (subComponents.length ? subComponents[0].dueDate : null);

    return {
        id: `${mod.id}:${a.id}`,
        assessmentId: a.id,
        moduleId: mod.id,
        moduleName: mod.name,
        title: a.name,
        type: "coursework",
        startDate,
        endDate,
        subComponents,
    };
}

/**
 * Transform the modules array into the exact shape the Gantt timeline needs.
 * Assessments without any date are omitted. Sorted by primary (end) date.
 */
export function modulesToTimeline(modules: Module[]): Deadline[] {
    const deadlines: Deadline[] = [];
    for (const mod of modules) {
        for (const a of mod.assessments) {
            const d = assessmentToDeadline(mod, a);
            if (d) deadlines.push(d);
        }
    }
    return deadlines.sort((a, b) => byDate(a.endDate, b.endDate));
}

/**
 * Expand deadlines into individual timeline moments: each exam/simple
 * coursework becomes one moment, while coursework with milestones yields one
 * moment per milestone. Sorted chronologically.
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
            });
        }
    }

    return moments.sort((a, b) => byDate(a.dueAt, b.dueAt));
}

/**
 * The single most urgent upcoming moment across all deadlines — drives the
 * dashboard's "Next Urgent Academic Deadline" widget.
 */
export function nextUrgentMoment(deadlines: Deadline[]): TimelineMoment | null {
    const now = Date.now();
    return (
        flattenDeadlines(deadlines).find(
            (m) => new Date(m.dueAt).getTime() >= now,
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
