// ─────────────────────────────────────────────────────────────────────────────
// Unified domain model.
//
// Modules and their assessments are the ABSOLUTE source of truth. The timeline
// is a pure, read-only projection derived from this data (see modulesToTimeline
// in timelineUtils) — there is no separately persisted deadlines collection.
//
// In-memory dates are ISO 8601 strings; they are stored as Firestore Timestamps
// inside the module document and converted at the store boundary
// (see src/store/useAcademicStore.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type AssessmentType = "coursework" | "exam";
export type GradeType = "letter" | "pct";

// ── GradeTrack (persisted: users/{uid}/modules/{moduleId}) ───────────────────

/**
 * A tracking sub-component of a coursework assessment (e.g. Proposal, Draft).
 * `weight` is a planning/display breakdown of the parent coursework and does
 * NOT feed the Lancaster aggregation, which is driven by Assessment.weight.
 */
export interface Milestone {
    id: string;
    title: string;
    dueDate: string; // ISO string
    weight: number; // % within the parent coursework (display only)
}

export interface Assessment {
    id: string;
    name: string;
    type: AssessmentType;
    weight: number; // % within its module — drives the Lancaster aggregation
    grade: string | number | null; // letter string or % number; null = not yet received
    gradeType: GradeType | null;

    // Timeline dates — the module/assessment record is the single source of truth.
    examDate?: string | null; // exam only — the sitting date/time
    startDate?: string | null; // coursework only — optional planning start
    dueDate?: string | null; // coursework only — the final due date/time
    milestones: Milestone[]; // coursework sub-components ([] for exams)
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

// ── Derived timeline view types (built from modules; never persisted alone) ──

/** A coursework milestone projected onto the timeline. */
export interface SubComponent {
    id: string;
    title: string;
    dueDate: string; // ISO string
    weight: number;
}

/**
 * A single bar/marker on the Gantt timeline, derived from one assessment.
 * Read-only — to change anything here, edit the owning module/assessment.
 */
export interface Deadline {
    id: string; // `${moduleId}:${assessmentId}`
    assessmentId: string;
    moduleId: string;
    moduleName: string;
    title: string; // the assessment name
    type: AssessmentType;
    startDate: string | null; // ISO string | null
    endDate: string; // ISO string — exam date or coursework final due
    subComponents: SubComponent[];
}

/** A single point on the timeline once a Deadline is flattened. */
export interface TimelineMoment {
    id: string;
    deadlineId: string;
    moduleId: string;
    deadlineTitle: string;
    title: string;
    dueAt: string; // ISO string
    kind: "exam" | "coursework" | "component";
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
