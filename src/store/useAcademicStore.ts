import { create } from "zustand";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
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
import { EXAMPLE_DEADLINES, EXAMPLE_MODULES } from "@/lib/seed";
import type {
    Assessment,
    AssessmentType,
    Deadline,
    GradeType,
    Module,
    SubComponent,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Consolidated global store for the merged application.
//
//   • Auth     — Firebase Auth session is mirrored into the store on load.
//   • Modules  — GradeTrack data, persisted at users/{uid}/modules/{moduleId}.
//   • Deadlines— CourseFlow data, persisted at users/{uid}/deadlines/{id}.
//
// Reads are driven by reactive Firestore onSnapshot listeners, so any change —
// local mutation or a write from another device — re-renders the UI in real
// time. Writes are fire-and-forget: the listener reflects them back into state.
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
    deadlines: Deadline[];
    modulesLoaded: boolean;
    deadlinesLoaded: boolean;
    error: string | null;

    // ── Lifecycle
    initAuth: () => void;
    startListening: (uid: string) => void;
    stopListening: () => void;
    logout: () => Promise<void>;

    // ── Module / assessment mutations (GradeTrack)
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

    // ── Deadline mutations (CourseFlow)
    addDeadline: (deadline: Omit<Deadline, "id" | "createdAt">) => Promise<void>;
    removeDeadline: (id: string) => Promise<void>;
    toggleSubComponent: (deadlineId: string, subId: string) => Promise<void>;
}

// ── Firestore path helpers ───────────────────────────────────────────────────

function modulesCol(uid: string): CollectionReference {
    return collection(getDb(), "users", uid, "modules");
}
function deadlinesCol(uid: string): CollectionReference {
    return collection(getDb(), "users", uid, "deadlines");
}
function moduleDoc(uid: string, id: string): DocumentReference {
    return doc(getDb(), "users", uid, "modules", id);
}
function deadlineDoc(uid: string, id: string): DocumentReference {
    return doc(getDb(), "users", uid, "deadlines", id);
}

// ── Document shapes (as persisted) ───────────────────────────────────────────

interface ModuleDocData {
    name: string;
    credits: number;
    assessments: Assessment[];
    aggregation: number | null;
    createdAt: number;
}

interface SubComponentDoc {
    id: string;
    title: string;
    dueDate: Timestamp;
    isCompleted: boolean;
}

interface DeadlineDocData {
    title: string;
    type: AssessmentType;
    startDate: Timestamp | null;
    endDate: Timestamp;
    subComponents: SubComponentDoc[];
    moduleId: string | null;
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

// ── Module converters ────────────────────────────────────────────────────────

function normaliseAssessment(a: Assessment): Assessment {
    // Firestore rejects `undefined`; coerce optionals to null.
    return {
        id: a.id,
        name: a.name,
        type: a.type,
        weight: a.weight,
        grade: a.grade ?? null,
        gradeType: a.gradeType ?? null,
    };
}

function moduleToDoc(m: Module): ModuleDocData {
    const result = calcModuleAgg(m);
    return {
        name: m.name,
        credits: m.credits,
        assessments: m.assessments.map(normaliseAssessment),
        aggregation: result ? result.effectiveAgg : null,
        createdAt: m.createdAt ?? Date.now(),
    };
}

function docToModule(id: string, data: ModuleDocData): Module {
    return {
        id,
        name: data.name,
        credits: data.credits,
        assessments: (data.assessments ?? []).map(normaliseAssessment),
        aggregation: data.aggregation ?? null,
        createdAt: data.createdAt ?? 0,
    };
}

// ── Deadline converters ──────────────────────────────────────────────────────

function deadlineToDoc(d: Omit<Deadline, "id">): DeadlineDocData {
    return {
        title: d.title,
        type: d.type,
        startDate: d.startDate ? isoToTimestamp(d.startDate) : null,
        endDate: isoToTimestamp(d.endDate),
        subComponents: d.subComponents.map((s) => ({
            id: s.id,
            title: s.title,
            dueDate: isoToTimestamp(s.dueDate),
            isCompleted: s.isCompleted,
        })),
        moduleId: d.moduleId ?? null,
        createdAt: d.createdAt ?? Date.now(),
    };
}

function docToDeadline(id: string, data: DeadlineDocData): Deadline {
    const subComponents: SubComponent[] = (data.subComponents ?? []).map(
        (s) => ({
            id: s.id,
            title: s.title,
            dueDate: toIso(s.dueDate),
            isCompleted: !!s.isCompleted,
        }),
    );
    return {
        id,
        title: data.title,
        type: data.type,
        startDate: toIsoNullable(data.startDate),
        endDate: toIso(data.endDate),
        subComponents,
        moduleId: data.moduleId ?? null,
        createdAt: data.createdAt ?? 0,
    };
}

// ── Listener / lifecycle bookkeeping (module-scoped, app-global) ─────────────

let authUnsub: (() => void) | null = null;
let modulesUnsub: (() => void) | null = null;
let deadlinesUnsub: (() => void) | null = null;
let listeningUid: string | null = null;
const seededUids = new Set<string>();

/**
 * Write the example modules + deadlines for a brand-new user the first time
 * both collections come back empty. Idempotent per uid and per document id.
 */
async function seedIfEmpty(uid: string): Promise<void> {
    const [modSnap, deadSnap] = await Promise.all([
        getDocs(modulesCol(uid)),
        getDocs(deadlinesCol(uid)),
    ]);
    if (!modSnap.empty || !deadSnap.empty) return;

    await Promise.all([
        ...EXAMPLE_MODULES.map((m) =>
            setDoc(moduleDoc(uid, m.id), moduleToDoc(m)),
        ),
        ...EXAMPLE_DEADLINES.map((d) =>
            setDoc(deadlineDoc(uid, d.id), deadlineToDoc(d)),
        ),
    ]);
}

export const useAcademicStore = create<AcademicState>()((set, get) => ({
    user: null,
    authReady: false,
    modules: [],
    deadlines: [],
    modulesLoaded: false,
    deadlinesLoaded: false,
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

        set({ modulesLoaded: false, deadlinesLoaded: false, error: null });

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

        deadlinesUnsub = onSnapshot(
            query(deadlinesCol(uid), orderBy("endDate")),
            (snap) => {
                set({
                    deadlines: snap.docs.map((d) =>
                        docToDeadline(d.id, d.data() as DeadlineDocData),
                    ),
                    deadlinesLoaded: true,
                });
            },
            (err: FirestoreError) =>
                set({ error: err.message, deadlinesLoaded: true }),
        );

        // First sign-in on an empty account: load the example data once.
        if (!seededUids.has(uid)) {
            seededUids.add(uid);
            void seedIfEmpty(uid).catch((e: unknown) =>
                set({
                    error: e instanceof Error ? e.message : "Failed to seed data",
                }),
            );
        }
    },

    stopListening: () => {
        modulesUnsub?.();
        deadlinesUnsub?.();
        modulesUnsub = null;
        deadlinesUnsub = null;
        listeningUid = null;
        set({
            modules: [],
            deadlines: [],
            modulesLoaded: false,
            deadlinesLoaded: false,
        });
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

    // ── Deadline mutations ───────────────────────────────────────────────────

    addDeadline: async (deadline) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const id = crypto.randomUUID();
        await setDoc(
            deadlineDoc(uid, id),
            deadlineToDoc({ ...deadline, createdAt: Date.now() }),
        );
    },

    removeDeadline: async (id) => {
        const uid = get().user?.uid;
        if (!uid) return;
        await deleteDoc(deadlineDoc(uid, id));
    },

    toggleSubComponent: async (deadlineId, subId) => {
        const uid = get().user?.uid;
        if (!uid) return;
        const current = get().deadlines.find((d) => d.id === deadlineId);
        if (!current) return;
        const updated: Deadline = {
            ...current,
            subComponents: current.subComponents.map((s) =>
                s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s,
            ),
        };
        await setDoc(deadlineDoc(uid, deadlineId), deadlineToDoc(updated));
    },
}));
