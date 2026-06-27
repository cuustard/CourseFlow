// Modules in the unified model carry no colour of their own, so the timeline
// derives a stable, deterministic colour from the module id. The same id always
// maps to the same swatch regardless of list ordering.

const PALETTE = [
    "#7c6ee0", // accent / violet
    "#3a7bd5", // blue
    "#3d9970", // green
    "#d4843a", // amber
    "#c0392b", // red
    "#0ea5e9", // sky
    "#db2777", // pink
    "#9333ea", // purple
    "#0d9488", // teal
    "#ca8a04", // gold
];

/** Neutral swatch for timeline items that aren't linked to a module. */
export const UNLINKED_COLOR = "#6b6866";

export function moduleColor(moduleId: string | null | undefined): string {
    if (!moduleId) return UNLINKED_COLOR;
    let hash = 0;
    for (let i = 0; i < moduleId.length; i++) {
        hash = (hash * 31 + moduleId.charCodeAt(i)) | 0;
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
}
