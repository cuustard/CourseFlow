"use client";

import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid,
    ReferenceLine,
} from "recharts";
import { Module } from "@/lib/types";
import { calcModuleAgg, getClassification, aggToExactPct } from "@/lib/gradeUtils";

interface Props {
    modules: Module[];
}

const AGG_TICKS = [0, 9, 12, 15, 18, 21, 24];

function pctLabel(agg: number): string {
    return `${Math.round(aggToExactPct(agg))}%`;
}

export default function ModuleChart({ modules }: Props) {
    const data = modules
        .map((m) => {
            const r = calcModuleAgg(m);
            if (!r) return null;
            return {
                name:
                    m.name.length > 12 ? m.name.slice(0, 12) + "…" : m.name,
                agg: parseFloat(r.effectiveAgg.toFixed(2)),
                // Ghost value ties the right axis to the data — same value, different label
                aggRight: parseFloat(r.effectiveAgg.toFixed(2)),
            };
        })
        .filter(Boolean) as { name: string; agg: number; aggRight: number }[];

    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center h-full text-[13px]"
                style={{ color: "var(--text3)" }}
            >
                No graded modules yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={224}>
            <BarChart data={data} margin={{ top: 4, right: 44, bottom: 0, left: -8 }}>
                {/* Subtle horizontal grid lines */}
                <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                />

                {/* Classification boundary lines */}
                <ReferenceLine
                    yAxisId="left"
                    y={17.5}
                    stroke="#7c6ee0"
                    strokeDasharray="4 3"
                    strokeOpacity={0.6}
                />
                <ReferenceLine
                    yAxisId="left"
                    y={14.5}
                    stroke="#3a7bd5"
                    strokeDasharray="4 3"
                    strokeOpacity={0.6}
                />
                <ReferenceLine
                    yAxisId="left"
                    y={11.5}
                    stroke="#3d9970"
                    strokeDasharray="4 3"
                    strokeOpacity={0.6}
                />
                <ReferenceLine
                    yAxisId="left"
                    y={9}
                    stroke="#d4843a"
                    strokeDasharray="4 3"
                    strokeOpacity={0.6}
                />

                <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />

                {/* Left axis — aggregation score */}
                <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 24]}
                    ticks={AGG_TICKS}
                    tick={{ fill: "var(--text3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                />

                {/* Right axis — percentage equivalent */}
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 24]}
                    ticks={AGG_TICKS}
                    tickFormatter={pctLabel}
                    tick={{ fill: "var(--text3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                />

                <Tooltip
                    contentStyle={{
                        background: "var(--bg3)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                    }}
                    formatter={(v, name) => {
                        if (name === "aggRight") return null; // hide ghost from tooltip
                        const n = typeof v === "number" ? v : 0;
                        return [
                            `${n.toFixed(2)} agg  (≈${aggToExactPct(n).toFixed(1)}%)`,
                            "Score",
                        ];
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />

                {/* Visible bars — left axis */}
                <Bar yAxisId="left" dataKey="agg" radius={[4, 4, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell
                            key={i}
                            fill={getClassification(entry.agg).color + "cc"}
                        />
                    ))}
                </Bar>

                {/* Ghost line — forces Recharts to render the right axis */}
                <Line
                    yAxisId="right"
                    dataKey="aggRight"
                    stroke="transparent"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    tooltipType="none"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
