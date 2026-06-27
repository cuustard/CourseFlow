interface Props {
    label: string;
    value: string;
    sub?: string;
    accent?: "accent" | "green" | "amber";
}

export default function KpiCard({ label, value, sub, accent }: Props) {
    const valueColor =
        accent === "accent"
            ? "var(--accent)"
            : accent === "green"
              ? "var(--green)"
              : accent === "amber"
                ? "var(--amber)"
                : "var(--text)";

    return (
        <div
            className="rounded-[10px] p-5"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            <div
                className="text-[11px] uppercase tracking-[0.06em] mb-2"
                style={{ color: "var(--text3)" }}
            >
                {label}
            </div>
            <div
                className="text-[26px] font-semibold tracking-tight font-mono leading-none"
                style={{ color: valueColor, fontFamily: "var(--font-dm-mono)" }}
            >
                {value}
            </div>
            {sub && (
                <div
                    className="text-[11px] mt-1"
                    style={{ color: "var(--text2)" }}
                >
                    {sub}
                </div>
            )}
        </div>
    );
}
