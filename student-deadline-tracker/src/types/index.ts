export type AssessmentType = "exam" | "coursework";

export interface Module {
    id: string;
    name: string;
    color: string;
}

export interface AssessmentComponent {
    id: string;
    title: string;
    dueAt: string;
}

export interface Assessment {
    id: string;
    moduleId: string;
    title: string;
    type: AssessmentType;
    dueAt: string;
    components?: AssessmentComponent[];
}

export interface TimelineItem {
    id: string;
    assessmentId: string;
    moduleId: string;
    assessmentTitle: string;
    title: string;
    dueAt: string;
    kind: "exam" | "coursework" | "component";
    parentType: AssessmentType;
}
