// ─────────────────────────────────────────────────────────────────────────────
// Unified domain model for the merged GradeTrack + CourseFlow application.
//
//   GradeTrack  → Modules, each holding weighted Assessments (grade tracking)
//   CourseFlow  → Deadlines, optionally linked to a Module (timeline planning)
//
// In-memory dates are ISO 8601 strings; they are converted to/from Firestore
// Timestamps at the store boundary (see src/store/useAcademicStore.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type AssessmentType = "coursework" | "exam";
export type GradeType = "letter" | "pct";

// ── GradeTrack ───────────────────────────────────────────────────────────────

export interface Assessment {
    id: string;
    name: string;
    type: AssessmentType;
    weight: number; // % within its module
    grade: string | number | null; // letter string or % number; null = not yet received
    gradeType: GradeType | null;
}

export interface Module {
    id: string;
    name: string;
    credits: number;
    assessments: Assessment[];
    /** Credit-weighted aggregation score, persisted on write for convenience. */
    aggregation?: number | null;
    /** Sort key — millisecond epoch the module was created. */
    createdAt?: number;
}

// ── CourseFlow (deadlines) ───────────────────────────────────────────────────

export interface SubComponent {
    id: string;
    title: string;
    dueDate: string; // ISO string
    isCompleted: boolean;
}

export interface Deadline {
    id: string;
    title: string;
    type: AssessmentType;
    /** Optional planning start; null for point-in-time items such as exams. */
    startDate: string | null; // ISO string | null
    /** The primary deadline. */
    endDate: string; // ISO string
    subComponents: SubComponent[];
    /** Optional explicit link to a GradeTrack module. */
    moduleId: string | null;
    /** Sort key — millisecond epoch the deadline was created. */
    createdAt?: number;
}

/** A single point on the timeline once a Deadline is flattened. */
export interface TimelineMoment {
    id: string;
    deadlineId: string;
    moduleId: string | null;
    deadlineTitle: string;
    title: string;
    dueAt: string; // ISO string
    kind: "exam" | "coursework" | "component";
    isCompleted: boolean;
}

// ── Grade-calculation helper shapes (Lancaster Appendix 1 & 2) ────────────────

export interface ClassificationBoundary {
    label: string;
    short: string;
    cls: string;
    agg: number;
    color: string;
}

export interface ModuleAggResult {
    partialAgg: number;
    weightDone: number;
    effectiveAgg: number;
}

export interface RequiredGradeResult {
    pct: number | null;
    agg: number;
    status: "achieved" | "impossible" | "tight" | "achievable";
}
