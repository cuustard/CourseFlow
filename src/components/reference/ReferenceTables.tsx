import { LETTER_GRADES, PCT_TO_AGG, getClassification } from "@/lib/gradeUtils";

export default function ReferenceTables() {
    return (
        <div className="p-8">
            <h1 className="text-[22px] font-semibold tracking-tight mb-1">
                Grade Tables
            </h1>
            <p className="text-[13px] mb-7" style={{ color: "var(--text2)" }}>
                Fixed classification boundaries and conversion tables
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Classification boundaries */}
                <div
                    className="rounded-[10px] p-5"
                    style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h2 className="text-[16px] font-medium mb-4 tracking-tight">
                        Classification Boundaries
                    </h2>
                    {[
                        {
                            label: "First Class Honours (1st)",
                            range: "17.50 – 24.00",
                            color: "#7c6ee0",
                        },
                        {
                            label: "Upper Second Class (2:1)",
                            range: "14.50 – 17.49",
                            color: "#3a7bd5",
                        },
                        {
                            label: "Lower Second Class (2:2)",
                            range: "11.50 – 14.49",
                            color: "#3d9970",
                        },
                        {
                            label: "Third Class Honours (3rd)",
                            range: "9.00 – 11.49",
                            color: "#d4843a",
                        },
                        { label: "Fail", range: "0.00 – 8.99", color: "#c0392b" },
                    ].map((b) => (
                        <div
                            key={b.label}
                            className="flex justify-between py-2"
                            style={{ borderBottom: "1px solid var(--border)" }}
                        >
                            <span style={{ color: "var(--text2)" }}>
                                {b.label}
                            </span>
                            <span
                                className="font-mono text-[13px]"
                                style={{
                                    color: b.color,
                                    fontFamily: "var(--font-dm-mono)",
                                }}
                            >
                                {b.range}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Letter grade table */}
                <div
                    className="rounded-[10px] p-5"
                    style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h2 className="text-[16px] font-medium mb-4 tracking-tight">
                        Letter Grade → Aggregation
                    </h2>
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr
                                style={{
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                {[
                                    "Letter",
                                    "Agg Score",
                                    "Range",
                                    "Classification",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left py-2 px-2 text-[11px] uppercase tracking-[0.06em]"
                                        style={{ color: "var(--text3)" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(LETTER_GRADES).map(
                                ([letter, { agg, range }]) => {
                                    const cls = getClassification(agg);
                                    return (
                                        <tr
                                            key={letter}
                                            style={{
                                                borderBottom:
                                                    "1px solid var(--border)",
                                            }}
                                        >
                                            <td className="py-1.5 px-2 font-medium">
                                                {letter}
                                            </td>
                                            <td
                                                className="py-1.5 px-2 font-mono"
                                                style={{
                                                    color: "var(--accent)",
                                                    fontFamily:
                                                        "var(--font-dm-mono)",
                                                }}
                                            >
                                                {agg.toFixed(1)}
                                            </td>
                                            <td
                                                className="py-1.5 px-2"
                                                style={{
                                                    color: "var(--text2)",
                                                }}
                                            >
                                                {range}
                                            </td>
                                            <td className="py-1.5 px-2">
                                                <span
                                                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                                                    style={{
                                                        background:
                                                            cls.color + "20",
                                                        color: cls.color,
                                                    }}
                                                >
                                                    {cls.short}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* % → Agg grid */}
            <div
                className="rounded-[10px] p-5"
                style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                }}
            >
                <h2 className="text-[16px] font-medium mb-1 tracking-tight">
                    % → Aggregation Score
                </h2>
                <p className="text-[12px] mb-5" style={{ color: "var(--text3)" }}>
                    Each cell shows the aggregation score for that percentage.
                    Colour indicates classification band.
                </p>

                {/* Legend */}
                <div className="flex gap-3 mb-4 flex-wrap">
                    {[
                        {
                            label: "First ≥17.5",
                            bg: "#7c6ee022",
                            border: "#7c6ee055",
                            text: "#9d8fe8",
                        },
                        {
                            label: "2:1 14.5–17.49",
                            bg: "#3a7bd522",
                            border: "#3a7bd555",
                            text: "#6a9be0",
                        },
                        {
                            label: "2:2 11.5–14.49",
                            bg: "#3d997022",
                            border: "#3d997055",
                            text: "#5db88a",
                        },
                        {
                            label: "Third 9–11.49",
                            bg: "#d4843a22",
                            border: "#d4843a55",
                            text: "#d4843a",
                        },
                        {
                            label: "Fail <9",
                            bg: "#c0392b22",
                            border: "#c0392b55",
                            text: "#e06b6b",
                        },
                    ].map((l) => (
                        <span
                            key={l.label}
                            className="flex items-center gap-1.5 text-[11px]"
                            style={{ color: l.text }}
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{
                                    background: l.bg,
                                    border: `1px solid ${l.border}`,
                                }}
                            />
                            {l.label}
                        </span>
                    ))}
                </div>

                {/* Row headers + grid */}
                <div className="flex gap-2">
                    {/* Row labels (tens) */}
                    <div className="flex flex-col gap-1 pt-6">
                        {Array.from({ length: 10 }, (_, i) => (
                            <div
                                key={i}
                                className="h-9 flex items-center justify-end pr-2 text-[11px] w-8"
                                style={{ color: "var(--text3)" }}
                            >
                                {i === 0 ? "1–" : `${i}0–`}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1">
                        {/* Column headers (units 0–9) */}
                        <div className="grid grid-cols-10 gap-1 mb-1">
                            {Array.from({ length: 10 }, (_, i) => (
                                <div
                                    key={i}
                                    className="text-center text-[11px]"
                                    style={{ color: "var(--text3)" }}
                                >
                                    +{i}
                                </div>
                            ))}
                        </div>

                        {/* Cells */}
                        {Array.from({ length: 10 }, (_, row) => (
                            <div
                                key={row}
                                className="grid grid-cols-10 gap-1 mb-1"
                            >
                                {Array.from({ length: 10 }, (_, col) => {
                                    const p = row * 10 + col + 1;
                                    if (p > 100) return <div key={col} />;
                                    const ag = PCT_TO_AGG[p];
                                    const cls = getClassification(ag);
                                    const styles: Record<
                                        string,
                                        {
                                            bg: string;
                                            border: string;
                                            text: string;
                                        }
                                    > = {
                                        first: {
                                            bg: "#7c6ee018",
                                            border: "#7c6ee044",
                                            text: "#b0a4f0",
                                        },
                                        two1: {
                                            bg: "#3a7bd518",
                                            border: "#3a7bd544",
                                            text: "#7aaee8",
                                        },
                                        two2: {
                                            bg: "#3d997018",
                                            border: "#3d997044",
                                            text: "#5dc490",
                                        },
                                        third: {
                                            bg: "#d4843a18",
                                            border: "#d4843a44",
                                            text: "#d4843a",
                                        },
                                        fail: {
                                            bg: "#c0392b18",
                                            border: "#c0392b44",
                                            text: "#e07070",
                                        },
                                    };
                                    const s = styles[cls.cls] ?? styles.fail;
                                    return (
                                        <div
                                            key={col}
                                            className="rounded-md flex flex-col items-center justify-center h-9"
                                            style={{
                                                background: s.bg,
                                                border: `1px solid ${s.border}`,
                                            }}
                                        >
                                            <span
                                                className="text-[10px] leading-none mb-0.5"
                                                style={{
                                                    color: "var(--text3)",
                                                }}
                                            >
                                                {p}%
                                            </span>
                                            <span
                                                className="text-[11px] font-medium leading-none"
                                                style={{
                                                    color: s.text,
                                                    fontFamily:
                                                        "var(--font-dm-mono)",
                                                }}
                                            >
                                                {ag.toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
