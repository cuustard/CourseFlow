type ModuleBadgeProps = {
    name: string;
    color: string;
};

export default function ModuleBadge({ name, color }: ModuleBadgeProps) {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
                background: color + "20",
                color,
                border: `1px solid ${color}40`,
            }}
        >
            <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
            />
            {name}
        </span>
    );
}
