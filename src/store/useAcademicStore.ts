import { useMemo } from "react";
import { create } from "zustand";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Timestamp,
    type CollectionReference,
    type DocumentReference,
    type FirestoreError,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import { calcModuleAgg } from "@/lib/gradeUtils";
import { modulesToTimeline } from "@/lib/timelineUtils";
import type {
    Assessment,
    AssessmentType,
    Deadline,
    GradeType,
    Milestone,
    Module,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Consolidated global store.
//
//   • Auth    — the Firebase Auth session is mirrored into the store on load.
//   • Modules — the ABSOLUTE source of truth, persisted at
//               users/{uid}/modules/{moduleId}. Each module embeds its weighted,
//               graded assessments, and each assessment embeds its timeline
//               dates + coursework milestones.
//
// The timeline is a pure projection of this data (useTimelineDeadlines) — there
// is no separately persisted deadlines collection to keep in sync. A single
// reactive onSnapshot listener on the modules collection drives the dashboard,
// the modules views AND the Gantt timeline simultaneously.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
    uid: string;
    email: string | null;
}

interface AcademicState {
    // ── Auth
    user: AuthUser | null;
    authReady: boolean;

    // ── Data
    modules: Module[];
    modulesLoaded: boolean;
    error: string | null;

    // ── Lifecycle
    initAuth: () => void;
    startListening: (uid: string) => void;
    stopListening: () => void;
    logout: () => Promise<void>;

    // ── Module / assessment mutations (the single write surface)
    addModule: (name: string, credits: number) => Promise<void>;
    removeModule: (id: string) => Promise<void>;
    addAssessment: (
        moduleId: string,
        assessment: Omit<Assessment, "id">,
    ) => Promise<void>;
    removeAssessment: (moduleId: string, assessmentId: string) => Promise<void>;
    updateAssessmentGrade: (
        moduleId: string,
        assessmentId: string,
        grade: string | number,
        gradeType: GradeType,
    ) => Promise<void>;
}

// ── Firestore path helpers ───────────────────────────────────────────────────

function modulesCol(uid: string): CollectionReference {
    return collection(getDb(), "users", uid, "modules");
}
function moduleDoc(uid: string, id: string): DocumentReference {
    return doc(getDb(), "users", uid, "modules", id);
}

// ── Document shapes (as persisted) ───────────────────────────────────────────

interface MilestoneDoc {
    id: string;
    title: string;
    dueDate: Timestamp;
    weight: number;
}

interface AssessmentDoc {
    id: string;
    name: string;
    type: AssessmentType;
    weight: number;
    grade: string | number | null;
    gradeType: GradeType | null;
    examDate: Timestamp | null;
    startDate: Timestamp | null;
    dueDate: Timestamp | null;
    milestones: MilestoneDoc[];
}

interface ModuleDocData {
    name: string;
    credits: number;
    assessments: AssessmentDoc[];
    aggregation: number | null;
    createdAt: number;
}

// ── Timestamp <-> ISO converters ─────────────────────────────────────────────

function toIso(value: unknown): string {
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    return new Date(String(value)).toISOString();
}

function toIsoNullable(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return toIso(value);
}

function isoToTimestamp(iso: string): Timestamp {
    return Timestamp.fromDate(new Date(iso));
}

// ── Module / assessment converters ───────────────────────────────────────────

function assessmentToDoc(a: Assessment): AssessmentDoc {
    // Firestore rejects `undefined`; coerce every optional to a concrete value.
    return {
        id: a.id,
        name: a.name,
        type: a.type,
        weight: a.weight,
        grade: a.grade ?? null,
        gradeType: a.gradeType ?? null,
        examDate: a.examDate ? isoToTimestamp(a.examDate) : null,
        startDate: a.startDate ? isoToTimestamp(a.startDate) : null,
        dueDate: a.dueDate ? isoToTimestamp(a.dueDate) : null,
        milestones: (a.milestones ?? []).map((m) => ({
            id: m.id,
            title: m.title,
            weight: m.weight,
            dueDate: isoToTimestamp(m.dueDate),
        })),
    };
}

function assessmentFromDoc(raw: AssessmentDoc): Assessment {
    const milestones: Milestone[] = (raw.milestones ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        weight: m.weight ?? 0,
        dueDate: toIso(m.dueDate),
    }));
    return {
        id: raw.id,
        name: raw.name,
        type: raw.type,
        weight: raw.weight,
        grade: raw.grade ?? null,
        gradeType: raw.gradeType ?? null,
        examDate: toIsoNullable(raw.examDate),
        startDate: toIsoNullable(raw.startDate),
        dueDate: toIsoNullable(raw.dueDate),
        milestones,
    };
}

function moduleToDoc(m: Module): ModuleDocData {
    const result = calcModuleAgg(m);
    return {
        name: m.name,
        credits: m.credits,
        assessments: m.assessments.map(assessmentToDoc),
        aggregation: result ? result.effectiveAgg : null,
        createdAt: m.createdAt ?? Date.now(),
    };
}

function docToModule(id: string, data: ModuleDocData): Module {
    return {
        id,
        name: data.name,
        credits: data.credits,
        assessments: (data.assessments ?? []).map(assessmentFromDoc),
        aggregation: data.aggregation ?? null,
        createdAt: data.createdAt ?? 0,
    };
}

// ── Listener / lifecycle bookkeeping (module-scoped, app-global) ─────────────

let authUnsub: (() => void) | null = null;
let modulesUnsub: (() => void) | null = null;
let listeningUid: string | null = null;

export const useAcademicStore = create<AcademicState>()((set, get) => ({
    user: null,
    authReady: false,
    modules: [],
    modulesLoaded: false,
    error: null,

    initAuth: () => {
        if (authUnsub) return; // app-global listener — set up once
        authUnsub = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
            if (fbUser) {
                set({
                    user: { uid: fbUser.uid, email: fbUser.email },
                    authReady: true,
                });
                get().startListening(fbUser.uid);
            } else {
                get().stopListening();
                set({ user: null, authReady: true });
            }
        });
    },

    startListening: (uid) => {
        if (listeningUid === uid) return; // already subscribed for this user
        get().stopListening();
        listeningUid = uid;

        set({ modulesLoaded: false, error: null });

        modulesUnsub = onSnapshot(
            query(modulesCol(uid), orderBy("createdAt")),
            (snap) => {
                set({
                    modules: snap.docs.map((d) =>
                        docToModule(d.id, d.data() as ModuleDocData),
                    ),
                    modulesLoaded: true,
                });
            },
            (err: FirestoreError) =>
                set({ error: err.message, modulesLoaded: true }),
        );
    },

    stopListening: () => {
        modulesUnsub?.();
        modulesUnsub = null;
        listeningUid = null;
        set({ modules: [], modulesLoaded: false });
    },

    logout: async () => {
        await signOut(getFirebaseAuth());
        // onAuthStateChanged handles teardown + state reset.
    },

    // ── Module / assessment mutations ────────────────────────────────────────

    addModule: async (name, credits) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const id = crypto.randomUUID();
        const m: Module = {
            id,
            name,
            credits,
            assessments: [],
            createdAt: Date.now(),
        };
        await setDoc(moduleDoc(uid, id), moduleToDoc(m));
    },

    removeModule: async (id) => {
        const uid = get().user?.uid;
        if (!uid) return;
        await deleteDoc(moduleDoc(uid, id));
    },

    addAssessment: async (moduleId, assessment) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const current = get().modules.find((m) => m.id === moduleId);
        if (!current) return;
        const updated: Module = {
            ...current,
            assessments: [
                ...current.assessments,
                { ...assessment, id: crypto.randomUUID() },
            ],
        };
        await setDoc(moduleDoc(uid, moduleId), moduleToDoc(updated));
    },

    removeAssessment: async (moduleId, assessmentId) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const current = get().modules.find((m) => m.id === moduleId);
        if (!current) return;
        const updated: Module = {
            ...current,
            assessments: current.assessments.filter(
                (a) => a.id !== assessmentId,
            ),
        };
        await setDoc(moduleDoc(uid, moduleId), moduleToDoc(updated));
    },

    updateAssessmentGrade: async (moduleId, assessmentId, grade, gradeType) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const current = get().modules.find((m) => m.id === moduleId);
        if (!current) return;
        const updated: Module = {
            ...current,
            assessments: current.assessments.map((a) =>
                a.id === assessmentId ? { ...a, grade, gradeType } : a,
            ),
        };
        await setDoc(moduleDoc(uid, moduleId), moduleToDoc(updated));
    },
}));

// ── Derived selectors ────────────────────────────────────────────────────────

/**
 * The read-only Gantt timeline, transformed from the live modules array.
 * Re-derives only when the modules snapshot changes, so any module/assessment
 * date edit or deletion updates the timeline reactively and simultaneously.
 */
export function useTimelineDeadlines(): Deadline[] {
    const modules = useAcademicStore((s) => s.modules);
    return useMemo(() => modulesToTimeline(modules), [modules]);
}
