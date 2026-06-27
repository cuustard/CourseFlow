"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAcademicStore } from "@/store/useAcademicStore";

type Mode = "signin" | "signup";

function friendlyAuthError(code: string): string {
    switch (code) {
        case "auth/invalid-email":
            return "That email address looks invalid.";
        case "auth/missing-password":
            return "Please enter a password.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/email-already-in-use":
            return "An account already exists for this email. Try signing in.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many attempts — please wait a moment and try again.";
        case "auth/network-request-failed":
            return "Network error. Check your connection and try again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export default function LoginPage() {
    const router = useRouter();
    const initAuth = useAcademicStore((s) => s.initAuth);
    const user = useAcademicStore((s) => s.user);
    const authReady = useAcademicStore((s) => s.authReady);

    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // Mirror the Firebase session into the store; redirect once authenticated.
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (authReady && user) router.replace("/");
    }, [authReady, user, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setErr("Enter your email address.");
            return;
        }
        if (!password) {
            setErr("Enter your password.");
            return;
        }

        setLoading(true);
        try {
            const firebaseAuth = getFirebaseAuth();
            if (mode === "signup") {
                await createUserWithEmailAndPassword(
                    firebaseAuth,
                    trimmedEmail,
                    password,
                );
            } else {
                await signInWithEmailAndPassword(
                    firebaseAuth,
                    trimmedEmail,
                    password,
                );
            }
            // The auth listener flips `user`, and the effect above redirects.
        } catch (error) {
            const code =
                error instanceof FirebaseError ? error.code : "auth/unknown";
            setErr(friendlyAuthError(code));
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div
                className="rounded-xl p-8 w-[420px] max-w-[90vw]"
                style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border2)",
                }}
            >
                <div className="text-center mb-6">
                    <div className="text-[18px] font-semibold tracking-tight">
                        🎓 CourseFlow
                    </div>
                    <div
                        className="text-[12px] mt-1"
                        style={{ color: "var(--text3)" }}
                    >
                        {mode === "signin"
                            ? "Sign in to your grades and deadlines"
                            : "Create an account to get started"}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <label
                        className="block text-[11px] uppercase tracking-[0.06em] mb-1"
                        style={{ color: "var(--text3)" }}
                    >
                        Email address
                    </label>
                    <input
                        className="gt-input"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />

                    <label
                        className="block text-[11px] uppercase tracking-[0.06em] mb-1 mt-4"
                        style={{ color: "var(--text3)" }}
                    >
                        Password
                    </label>
                    <input
                        className="gt-input"
                        type="password"
                        autoComplete={
                            mode === "signin"
                                ? "current-password"
                                : "new-password"
                        }
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {err && (
                        <p
                            className="text-[11px] mt-2"
                            style={{ color: "var(--red)" }}
                            role="alert"
                        >
                            {err}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="gt-btn-primary w-full mt-4 justify-center"
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1 }}
                    >
                        {loading
                            ? "Please wait…"
                            : mode === "signin"
                              ? "Sign in"
                              : "Create account"}
                    </button>
                </form>

                <div
                    className="text-center text-[12px] mt-5"
                    style={{ color: "var(--text2)" }}
                >
                    {mode === "signin" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                className="font-medium"
                                style={{ color: "var(--accent)" }}
                                onClick={() => {
                                    setMode("signup");
                                    setErr("");
                                }}
                            >
                                Create one
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="font-medium"
                                style={{ color: "var(--accent)" }}
                                onClick={() => {
                                    setMode("signin");
                                    setErr("");
                                }}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
