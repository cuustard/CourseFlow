type ModuleBadgeProps = {
    name: string;
    color: string;
};

export default function ModuleBadge({ name, color }: ModuleBadgeProps) {
    return (
        <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
        >
            {name}
        </span>
    );
}
