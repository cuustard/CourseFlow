type SummaryCardProps = {
    label: string;
    value: string | number;
    helperText?: string;
};

export default function SummaryCard({
    label,
    value,
    helperText,
}: SummaryCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

            {helperText && (
                <p className="mt-2 text-sm text-slate-600">{helperText}</p>
            )}
        </div>
    );
}
