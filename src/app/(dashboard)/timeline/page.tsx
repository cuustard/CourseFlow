import { Suspense } from "react";
import TimelineView from "@/components/timeline/TimelineView";

export default function TimelinePage() {
    return (
        <Suspense fallback={null}>
            <TimelineView />
        </Suspense>
    );
}
