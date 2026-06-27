import type { Assessment, Module } from "@/types";

export const modules: Module[] = [
    { id: "m1", name: "Databases", color: "#2563eb" },
    { id: "m2", name: "Artificial Intelligence", color: "#16a34a" },
    { id: "m3", name: "Web Development", color: "#ea580c" },
    { id: "m4", name: "Operating Systems", color: "#9333ea" },
    { id: "m5", name: "Software Engineering", color: "#dc2626" },
];

export const assessments: Assessment[] = [
    {
        id: "a1",
        moduleId: "m1",
        title: "Database Systems Exam",
        type: "exam",
        dueAt: "2026-07-15T09:00:00",
    },
    {
        id: "a2",
        moduleId: "m2",
        title: "AI Coursework",
        type: "coursework",
        dueAt: "2026-08-01T16:00:00",
        components: [
            {
                id: "c1",
                title: "Proposal",
                dueAt: "2026-07-04T16:00:00",
            },
            {
                id: "c2",
                title: "Draft",
                dueAt: "2026-07-18T16:00:00",
            },
            {
                id: "c3",
                title: "Final Submission",
                dueAt: "2026-08-01T16:00:00",
            },
        ],
    },
    {
        id: "a3",
        moduleId: "m3",
        title: "Portfolio Website",
        type: "coursework",
        dueAt: "2026-07-24T17:00:00",
        components: [
            {
                id: "c4",
                title: "Wireframes",
                dueAt: "2026-06-30T17:00:00",
            },
            {
                id: "c5",
                title: "Responsive Build",
                dueAt: "2026-07-13T17:00:00",
            },
            {
                id: "c6",
                title: "Accessibility Review",
                dueAt: "2026-07-24T17:00:00",
            },
        ],
    },
    {
        id: "a4",
        moduleId: "m4",
        title: "Operating Systems Exam",
        type: "exam",
        dueAt: "2026-07-09T13:30:00",
    },
    {
        id: "a5",
        moduleId: "m5",
        title: "Software Engineering Group Project",
        type: "coursework",
        dueAt: "2026-07-31T12:00:00",
        components: [
            {
                id: "c7",
                title: "Requirements Spec",
                dueAt: "2026-07-02T12:00:00",
            },
            {
                id: "c8",
                title: "Sprint 1 Demo",
                dueAt: "2026-07-16T12:00:00",
            },
            {
                id: "c9",
                title: "Final Report",
                dueAt: "2026-07-31T12:00:00",
            },
        ],
    },
    {
        id: "a6",
        moduleId: "m1",
        title: "SQL Query Assignment",
        type: "coursework",
        dueAt: "2026-07-06T23:59:00",
    },
    {
        id: "a7",
        moduleId: "m3",
        title: "JavaScript Fundamentals Quiz",
        type: "exam",
        dueAt: "2026-06-29T10:00:00",
    },
];
