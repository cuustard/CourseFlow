export default function HomePage() {
    return (
        <main className="min-h-screen bg-white p-6 text-slate-900">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold tracking-tight">
                    Student Deadline Tracker
                </h1>

                <p className="mt-2 text-slate-600">
                    Visualise exams, coursework, and multi-part deadlines in one
                    place.
                </p>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border p-4 shadow-sm">
                        <h2 className="font-semibold">Upcoming</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Your next exam and coursework deadlines will show
                            here.
                        </p>
                    </div>

                    <div className="rounded-2xl border p-4 shadow-sm">
                        <h2 className="font-semibold">Modules</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Group deadlines by module.
                        </p>
                    </div>

                    <div className="rounded-2xl border p-4 shadow-sm">
                        <h2 className="font-semibold">Components</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Track draft, final, presentation, and other
                            submission parts.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
