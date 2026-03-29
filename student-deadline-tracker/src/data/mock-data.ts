import type { Assessment, Module } from "@/types";

export const modules: Module[] = [
    { id: "m1", name: "Databases", color: "#2563eb" },
    { id: "m2", name: "Artificial Intelligence", color: "#16a34a" },
    { id: "m3", name: "Web Development", color: "#ea580c" },
];

export const assessments: Assessment[] = [
    {
        id: "a1",
        moduleId: "m1",
        title: "Database Systems Exam",
        type: "exam",
        dueAt: "2026-05-12T09:00:00",
    },
    {
        id: "a2",
        moduleId: "m2",
        title: "AI Coursework",
        type: "coursework",
        dueAt: "2026-05-20T16:00:00",
        components: [
            {
                id: "c1",
                title: "Proposal",
                dueAt: "2026-05-01T16:00:00",
            },
            {
                id: "c2",
                title: "Draft",
                dueAt: "2026-05-10T16:00:00",
            },
            {
                id: "c3",
                title: "Final Submission",
                dueAt: "2026-05-20T16:00:00",
            },
        ],
    },
];
