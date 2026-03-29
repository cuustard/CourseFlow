import type { Assessment, TimelineItem } from "@/types";

export function getAssessmentRelevantDate(assessment: Assessment): string {
    if (!assessment.components || assessment.components.length === 0) {
        return assessment.dueAt;
    }

    const now = new Date();

    const sortedComponentDates = assessment.components
        .map((component) => component.dueAt)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const nextUpcomingComponentDate = sortedComponentDates.find(
        (date) => new Date(date).getTime() >= now.getTime()
    );

    return nextUpcomingComponentDate ?? assessment.dueAt;
}

export function getDaysUntil(dateString: string): number {
    const now = new Date();
    const target = new Date(dateString);
    return (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

export function sortAssessmentsByRelevantDate(
    assessments: Assessment[]
): Assessment[] {
    return [...assessments].sort(
        (a, b) =>
            new Date(getAssessmentRelevantDate(a)).getTime() -
            new Date(getAssessmentRelevantDate(b)).getTime()
    );
}

export function flattenAssessmentsToTimelineItems(
    assessments: Assessment[]
): TimelineItem[] {
    const items: TimelineItem[] = [];

    for (const assessment of assessments) {
        if (assessment.type === "exam") {
            items.push({
                id: `exam-${assessment.id}`,
                assessmentId: assessment.id,
                moduleId: assessment.moduleId,
                assessmentTitle: assessment.title,
                title: assessment.title,
                dueAt: assessment.dueAt,
                kind: "exam",
                parentType: assessment.type,
            });

            continue;
        }

        if (assessment.components && assessment.components.length > 0) {
            for (const component of assessment.components) {
                items.push({
                    id: `component-${component.id}`,
                    assessmentId: assessment.id,
                    moduleId: assessment.moduleId,
                    assessmentTitle: assessment.title,
                    title: component.title,
                    dueAt: component.dueAt,
                    kind: "component",
                    parentType: assessment.type,
                });
            }
        } else {
            items.push({
                id: `coursework-${assessment.id}`,
                assessmentId: assessment.id,
                moduleId: assessment.moduleId,
                assessmentTitle: assessment.title,
                title: assessment.title,
                dueAt: assessment.dueAt,
                kind: "coursework",
                parentType: assessment.type,
            });
        }
    }

    return items.sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    );
}
