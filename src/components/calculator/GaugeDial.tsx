import { getClassification } from "@/lib/gradeUtils";

interface Props {
    agg: number;
}

const MAX = 24;
const CX = 100,
    CY = 105,
    R = 75;
const START_ANGLE = (-200 * Math.PI) / 180;
const SWEEP = (220 * Math.PI) / 180;

const SEGMENTS = [
    { from: 0, to: 9, color: "#c0392b66" },
    { from: 9, to: 11.5, color: "#d4843a66" },
    { from: 11.5, to: 14.5, color: "#3d997066" },
    { from: 14.5, to: 17.5, color: "#3a7bd566" },
    { from: 17.5, to: 24, color: "#7c6ee066" },
];

function arcPath(a1: number, a2: number, radius: number) {
    const x1 = CX + radius * Math.cos(a1),
        y1 = CY + radius * Math.sin(a1);
    const x2 = CX + radius * Math.cos(a2),
        y2 = CY + radius * Math.sin(a2);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2}`;
}

export default function GaugeDial({ agg }: Props) {
    const pct = Math.min(1, agg / MAX);
    const needleAngle = START_ANGLE + SWEEP * pct;
    const fillEnd = START_ANGLE + SWEEP * pct;
    const cls = getClassification(agg);
    const nx = CX + 65 * Math.cos(needleAngle);
    const ny = CY + 65 * Math.sin(needleAngle);
    const endAngle = START_ANGLE + SWEEP;

    return (
        <svg viewBox="0 0 200 130" className="w-full max-w-[200px] block mx-auto">
            {/* Background segments */}
            {SEGMENTS.map((s) => {
                const a1 = START_ANGLE + SWEEP * (s.from / MAX);
                const a2 = START_ANGLE + SWEEP * (s.to / MAX);
                return (
                    <path
                        key={s.from}
                        d={arcPath(a1, a2, R)}
                        stroke={s.color}
                        strokeWidth={12}
                        fill="none"
                        strokeLinecap="butt"
                    />
                );
            })}

            {/* Filled arc */}
            <path
                d={arcPath(START_ANGLE, fillEnd, R)}
                stroke={cls.color}
                strokeWidth={12}
                fill="none"
                strokeLinecap="round"
                opacity={0.9}
            />

            {/* Needle */}
            <line
                x1={CX}
                y1={CY}
                x2={nx}
                y2={ny}
                stroke={cls.color}
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <circle cx={CX} cy={CY} r={5} fill={cls.color} />

            {/* Labels */}
            <text
                x={CX}
                y={CY + 22}
                textAnchor="middle"
                fill="#e8e6e1"
                fontSize={18}
                fontFamily="DM Mono,monospace"
                fontWeight={500}
            >
                {agg.toFixed(2)}
            </text>
            <text
                x={CX}
                y={CY + 36}
                textAnchor="middle"
                fill="#6b6866"
                fontSize={9}
                fontFamily="DM Sans,sans-serif"
            >
                / 24.00
            </text>
            <text
                x={CX + Math.cos(START_ANGLE) * 88}
                y={CY + Math.sin(START_ANGLE) * 88 + 4}
                textAnchor="middle"
                fill="#6b6866"
                fontSize={9}
                fontFamily="DM Mono,monospace"
            >
                0
            </text>
            <text
                x={CX + Math.cos(endAngle) * 88}
                y={CY + Math.sin(endAngle) * 88 + 4}
                textAnchor="middle"
                fill="#6b6866"
                fontSize={9}
                fontFamily="DM Mono,monospace"
            >
                24
            </text>
        </svg>
    );
}
