type SummaryCardProps = {
    label: string;
    value: string | number;
    helperText?: string;
    action?: React.ReactNode;
    variant?: "default" | "muted";
};

export default function SummaryCard({
    label,
    value,
    helperText,
    action,
    variant = "default",
}: SummaryCardProps) {
    return (
        <div
            className="flex flex-col rounded-[10px] p-4"
            style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
            }}
        >
            <p
                className="text-[11px] uppercase tracking-[0.06em]"
                style={{ color: "var(--text3)" }}
            >
                {label}
            </p>
            <p
                className="mt-2 text-[20px] font-semibold tracking-tight leading-tight"
                style={{
                    color:
                        variant === "muted" ? "var(--text3)" : "var(--text)",
                }}
            >
                {value}
            </p>

            {helperText && (
                <p className="mt-1 text-[12px]" style={{ color: "var(--text2)" }}>
                    {helperText}
                </p>
            )}

            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
