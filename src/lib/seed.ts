import type { Deadline, Module } from "./types";

// Example data written into a brand-new user's Firestore the first time they
// sign in with empty collections (see useAcademicStore.maybeSeed). Module ids
// are fixed so the example deadlines can reference them via moduleId, which in
// turn makes the cross-feature linking (timeline filter, "next urgent deadline",
// "view on timeline") demonstrable out of the box.

export const EXAMPLE_MODULES: Module[] = [
    {
        id: "m-databases",
        name: "Databases",
        credits: 15,
        createdAt: 1,
        assessments: [
            {
                id: "a-db-cw",
                name: "Coursework",
                type: "coursework",
                weight: 40,
                grade: 68,
                gradeType: "pct",
            },
            {
                id: "a-db-exam",
                name: "Final Exam",
                type: "exam",
                weight: 60,
                grade: null,
                gradeType: null,
            },
        ],
    },
    {
        id: "m-ai",
        name: "Artificial Intelligence",
        credits: 15,
        createdAt: 2,
        assessments: [
            {
                id: "a-ai-cw",
                name: "Coursework",
                type: "coursework",
                weight: 50,
                grade: 72,
                gradeType: "pct",
            },
            {
                id: "a-ai-exam",
                name: "Final Exam",
                type: "exam",
                weight: 50,
                grade: null,
                gradeType: null,
            },
        ],
    },
    {
        id: "m-web",
        name: "Web Development",
        credits: 15,
        createdAt: 3,
        assessments: [
            {
                id: "a-web-cw",
                name: "Portfolio Project",
                type: "coursework",
                weight: 100,
                grade: 65,
                gradeType: "pct",
            },
        ],
    },
    {
        id: "m-os",
        name: "Operating Systems",
        credits: 15,
        createdAt: 4,
        assessments: [
            {
                id: "a-os-exam",
                name: "Final Exam",
                type: "exam",
                weight: 100,
                grade: null,
                gradeType: null,
            },
        ],
    },
    {
        id: "m-se",
        name: "Software Engineering",
        credits: 30,
        createdAt: 5,
        assessments: [
            {
                id: "a-se-group",
                name: "Group Project",
                type: "coursework",
                weight: 60,
                grade: 70,
                gradeType: "pct",
            },
            {
                id: "a-se-report",
                name: "Individual Report",
                type: "coursework",
                weight: 40,
                grade: 66,
                gradeType: "pct",
            },
        ],
    },
];

export const EXAMPLE_DEADLINES: Deadline[] = [
    {
        id: "d-db-exam",
        title: "Database Systems Exam",
        type: "exam",
        startDate: null,
        endDate: "2026-07-15T09:00:00",
        subComponents: [],
        moduleId: "m-databases",
        createdAt: 1,
    },
    {
        id: "d-ai-cw",
        title: "AI Coursework",
        type: "coursework",
        startDate: "2026-07-04T16:00:00",
        endDate: "2026-08-01T16:00:00",
        subComponents: [
            {
                id: "s-ai-1",
                title: "Proposal",
                dueDate: "2026-07-04T16:00:00",
                isCompleted: false,
            },
            {
                id: "s-ai-2",
                title: "Draft",
                dueDate: "2026-07-18T16:00:00",
                isCompleted: false,
            },
            {
                id: "s-ai-3",
                title: "Final Submission",
                dueDate: "2026-08-01T16:00:00",
                isCompleted: false,
            },
        ],
        moduleId: "m-ai",
        createdAt: 2,
    },
    {
        id: "d-web-portfolio",
        title: "Portfolio Website",
        type: "coursework",
        startDate: "2026-06-30T17:00:00",
        endDate: "2026-07-24T17:00:00",
        subComponents: [
            {
                id: "s-web-1",
                title: "Wireframes",
                dueDate: "2026-06-30T17:00:00",
                isCompleted: false,
            },
            {
                id: "s-web-2",
                title: "Responsive Build",
                dueDate: "2026-07-13T17:00:00",
                isCompleted: false,
            },
            {
                id: "s-web-3",
                title: "Accessibility Review",
                dueDate: "2026-07-24T17:00:00",
                isCompleted: false,
            },
        ],
        moduleId: "m-web",
        createdAt: 3,
    },
    {
        id: "d-os-exam",
        title: "Operating Systems Exam",
        type: "exam",
        startDate: null,
        endDate: "2026-07-09T13:30:00",
        subComponents: [],
        moduleId: "m-os",
        createdAt: 4,
    },
    {
        id: "d-se-group",
        title: "Software Engineering Group Project",
        type: "coursework",
        startDate: "2026-07-02T12:00:00",
        endDate: "2026-07-31T12:00:00",
        subComponents: [
            {
                id: "s-se-1",
                title: "Requirements Spec",
                dueDate: "2026-07-02T12:00:00",
                isCompleted: false,
            },
            {
                id: "s-se-2",
                title: "Sprint 1 Demo",
                dueDate: "2026-07-16T12:00:00",
                isCompleted: false,
            },
            {
                id: "s-se-3",
                title: "Final Report",
                dueDate: "2026-07-31T12:00:00",
                isCompleted: false,
            },
        ],
        moduleId: "m-se",
        createdAt: 5,
    },
    {
        id: "d-db-sql",
        title: "SQL Query Assignment",
        type: "coursework",
        startDate: null,
        endDate: "2026-07-06T23:59:00",
        subComponents: [],
        moduleId: "m-databases",
        createdAt: 6,
    },
    {
        id: "d-web-quiz",
        title: "JavaScript Fundamentals Quiz",
        type: "exam",
        startDate: null,
        endDate: "2026-06-29T10:00:00",
        subComponents: [],
        moduleId: "m-web",
        createdAt: 7,
    },
];
