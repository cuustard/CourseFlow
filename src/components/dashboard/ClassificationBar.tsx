"use client";

import {
    getClassification,
    getBorderline,
    BORDERLINES,
} from "@/lib/gradeUtils";

interface Props {
    agg: number | null;
}

// UG 5.5 strict boundaries
const SEGMENTS = [
    { label: "Fail", from: 0, to: 9, bg: "#c0392b20" },
    { label: "3rd", from: 9, to: 11.5, bg: "#d4843a20" },
    { label: "2:2", from: 11.5, to: 14.5, bg: "#3d997020" },
    { label: "2:1", from: 14.5, to: 17.5, bg: "#3a7bd530" },
    { label: "1st", from: 17.5, to: 24, bg: "#7c6ee030" },
];

// UG 5.6 borderline ranges
const BORDERLINE_ZONES = [
    { from: 17.1, to: 17.4, color: "#7c6ee0" },
    { from: 14.1, to: 14.4, color: "#3a7bd5" },
    { from: 11.1, to: 11.4, color: "#3d9970" },
    { from: 8.1, to: 8.9, color: "#d4843a" },
];

const MAX = 24;
const MARKERS = [9, 11.5, 14.5, 17.5];

export default function ClassificationBar({ agg }: Props) {
    if (agg === null) {
        return (
            <div
                className="text-center py-8 text-[13px]"
                style={{ color: "var(--text3)" }}
            >
                Add modules and grades to see your classification
            </div>
        );
    }

    const cls = getClassification(agg);
    const borderline = getBorderline(agg);

    // Also flag if within 0.1 of a borderline zone (accounts for ±0.1 rounding vs Lancaster portal)
    const nearBorderline = !borderline
        ? (BORDERLINES.find((b) => {
              const distToZone = b.min - agg;
              return distToZone > 0 && distToZone <= 0.1;
          }) ?? null)
        : null;

    const myPct = ((agg / MAX) * 100).toFixed(2);

    return (
        <div>
            <div className="text-[12px] mb-1" style={{ color: "var(--text2)" }}>
                Score:{" "}
                <strong style={{ color: "var(--accent)" }}>
                    {agg.toFixed(1)}
                </strong>{" "}
                / 24.0
                {" — "}
                <strong style={{ color: cls.color }}>{cls.label}</strong>
            </div>

            {/* Borderline notice */}
            {borderline && (
                <div
                    className="text-[11px] px-3 py-1.5 rounded-md mb-3 flex items-center gap-2"
                    style={{
                        background: borderline.color + "15",
                        border: `1px solid ${borderline.color}40`,
                        color: borderline.color,
                    }}
                >
                    <span>⚠</span>
                    <span>
                        Borderline zone — you may be awarded{" "}
                        <strong>{borderline.higher}</strong> if half or more of
                        your Part II credits are in that class, or your final
                        year average is in that class (UG 5.6).
                    </span>
                </div>
            )}

            {/* Near-borderline notice — accounts for ±0.1 rounding vs Lancaster portal */}
            {nearBorderline && (
                <div
                    className="text-[11px] px-3 py-1.5 rounded-md mb-3 flex items-center gap-2"
                    style={{
                        background: nearBorderline.color + "10",
                        border: `1px solid ${nearBorderline.color}30`,
                        color: nearBorderline.color,
                    }}
                >
                    <span>ⓘ</span>
                    <span>
                        Your score is within 0.1 of the{" "}
                        <strong>{nearBorderline.higher}</strong> borderline zone
                        ({nearBorderline.min}–{nearBorderline.max}). Due to a
                        ±0.1 rounding difference between this app and
                        Lancaster&apos;s system, you may already be in this zone
                        — check your Interactive Transcript to confirm.
                    </span>
                </div>
            )}

            <div className="relative pt-7 mb-2">
                {/* Boundary labels */}
                {MARKERS.map((v) => (
                    <div
                        key={v}
                        className="absolute top-0 text-[10px] -translate-x-1/2"
                        style={{
                            left: `${(v / MAX) * 100}%`,
                            color: "var(--text3)",
                        }}
                    >
                        {v}
                    </div>
                ))}

                {/* Bar */}
                <div
                    className="relative h-8 rounded-lg overflow-hidden"
                    style={{ background: "var(--bg3)" }}
                >
                    {SEGMENTS.map((s) => (
                        <div
                            key={s.label}
                            className="absolute h-full flex items-center justify-center text-[10px] font-semibold"
                            style={{
                                left: `${(s.from / MAX) * 100}%`,
                                width: `${((s.to - s.from) / MAX) * 100}%`,
                                background: s.bg,
                                color: "rgba(255,255,255,0.5)",
                            }}
                        >
                            {s.label}
                        </div>
                    ))}

                    {/* Borderline zone overlays */}
                    {BORDERLINE_ZONES.map((z) => (
                        <div
                            key={z.from}
                            className="absolute h-full"
                            style={{
                                left: `${(z.from / MAX) * 100}%`,
                                width: `${((z.to - z.from) / MAX) * 100}%`,
                                background: `repeating-linear-gradient(45deg, ${z.color}30, ${z.color}30 2px, transparent 2px, transparent 6px)`,
                                borderLeft: `1px solid ${z.color}60`,
                                borderRight: `1px solid ${z.color}60`,
                            }}
                        />
                    ))}

                    {/* Needle */}
                    <div
                        className="absolute top-0 h-full w-0.5 -translate-x-1/2"
                        style={{
                            left: `${myPct}%`,
                            background: "var(--accent)",
                        }}
                    />
                    <div
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                            left: `${myPct}%`,
                            background: "var(--accent)",
                            borderColor: "var(--bg)",
                        }}
                    />
                </div>
            </div>

            {/* Legend */}
            <div
                className="flex flex-wrap gap-3 mt-3 text-[11px]"
                style={{ color: "var(--text2)" }}
            >
                {[
                    { label: "Fail <9", bg: "#c0392b20", border: "#c0392b40" },
                    {
                        label: "Third 9–11.0",
                        bg: "#d4843a20",
                        border: "#d4843a40",
                    },
                    {
                        label: "2:2 11.5–14.0",
                        bg: "#3d997020",
                        border: "#3d997040",
                    },
                    {
                        label: "2:1 14.5–17.0",
                        bg: "#3a7bd530",
                        border: "#3a7bd550",
                    },
                    {
                        label: "1st ≥17.5",
                        bg: "#7c6ee030",
                        border: "#7c6ee050",
                    },
                ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{
                                background: l.bg,
                                border: `1px solid ${l.border}`,
                            }}
                        />
                        {l.label}
                    </span>
                ))}
                <span
                    className="flex items-center gap-1"
                    style={{ color: "var(--text3)" }}
                >
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-sm"
                        style={{
                            background:
                                "repeating-linear-gradient(45deg,#888830,#888830 2px,transparent 2px,transparent 6px)",
                            border: "1px solid #88883060",
                        }}
                    />
                    Borderline (UG 5.6)
                </span>
            </div>
        </div>
    );
}
