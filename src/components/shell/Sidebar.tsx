"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Book,
    Calculator,
    CalendarClock,
    Table,
    LogOut,
} from "lucide-react";
import { useAcademicStore } from "@/store/useAcademicStore";

interface NavLink {
    href: string;
    label: string;
    icon: React.ReactNode;
    section: string;
}

const NAV_LINKS: NavLink[] = [
    {
        href: "/",
        label: "Dashboard",
        icon: <LayoutDashboard size={16} />,
        section: "Overview",
    },
    {
        href: "/modules",
        label: "Modules",
        icon: <Book size={16} />,
        section: "Academic",
    },
    {
        href: "/calculator",
        label: "Required Grades",
        icon: <Calculator size={16} />,
        section: "Academic",
    },
    {
        href: "/timeline",
        label: "Timeline",
        icon: <CalendarClock size={16} />,
        section: "Academic",
    },
    {
        href: "/reference",
        label: "Grade Tables",
        icon: <Table size={16} />,
        section: "Reference",
    },
];

const SECTIONS = ["Overview", "Academic", "Reference"];

function isActive(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ userEmail }: { userEmail: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAcademicStore((s) => s.logout);

    async function handleSignOut() {
        await logout();
        router.replace("/login");
    }

    return (
        <nav
            className="w-[220px] flex-shrink-0 flex flex-col sticky top-0 h-screen"
            style={{
                background: "var(--bg2)",
                borderRight: "1px solid var(--border)",
            }}
        >
            {/* Logo */}
            <div
                className="px-5 pb-6 pt-5"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div className="text-[15px] font-semibold tracking-tight">
                    🎓 CourseFlow
                </div>
                <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text3)" }}
                >
                    Grades &amp; deadlines
                </div>
            </div>

            {/* Nav */}
            <div className="mt-3">
                {SECTIONS.map((section) => (
                    <div key={section}>
                        <div className="nav-section">{section}</div>
                        {NAV_LINKS.filter((l) => l.section === section).map(
                            (link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-2 w-full px-5 py-2 text-[13px] transition-colors text-left"
                                    style={{
                                        color: isActive(pathname, link.href)
                                            ? "var(--text)"
                                            : "var(--text2)",
                                        background: isActive(pathname, link.href)
                                            ? "var(--bg3)"
                                            : "transparent",
                                    }}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ),
                        )}
                    </div>
                ))}
            </div>

            {/* Account footer */}
            <div
                className="mt-auto px-5 py-4"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                {userEmail && (
                    <div
                        className="text-[11px] mb-2 truncate"
                        style={{ color: "var(--text3)" }}
                        title={userEmail}
                    >
                        {userEmail}
                    </div>
                )}
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-[12px] transition-colors text-left"
                    style={{ color: "var(--text2)" }}
                >
                    <LogOut size={14} /> Sign out
                </button>
            </div>

            <style jsx>{`
                .nav-section {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    color: var(--text3);
                    padding: 16px 20px 6px;
                    text-transform: uppercase;
                }
            `}</style>
        </nav>
    );
}
