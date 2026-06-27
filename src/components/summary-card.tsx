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
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
                className={`mt-2 text-2xl font-bold ${
                    variant === "muted" ? "text-slate-400" : "text-slate-900"
                }`}
            >
                {value}
            </p>

            {helperText && (
                <p className="mt-1 text-sm text-slate-600">{helperText}</p>
            )}

            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
