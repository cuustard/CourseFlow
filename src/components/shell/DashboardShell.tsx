"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/useAcademicStore";
import Sidebar from "./Sidebar";

/**
 * Client boundary for the authenticated area. Owns the Firebase auth listener
 * (via the store), guards the routes, and renders the persistent sidebar shell
 * around the active page. Firestore listeners start automatically once the
 * store learns who the signed-in user is.
 */
export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const initAuth = useAcademicStore((s) => s.initAuth);
    const user = useAcademicStore((s) => s.user);
    const authReady = useAcademicStore((s) => s.authReady);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (authReady && !user) router.replace("/login");
    }, [authReady, user, router]);

    if (!authReady || !user) {
        return (
            <div
                className="min-h-screen flex items-center justify-center text-[13px]"
                style={{ color: "var(--text3)" }}
            >
                Loading…
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar userEmail={user.email ?? ""} />
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
