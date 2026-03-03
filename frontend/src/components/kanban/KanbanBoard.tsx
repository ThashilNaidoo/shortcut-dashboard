import type { StoryDTO } from "../../api/types";

import { COLUMNS, groupStoriesByColumn } from "./kanban";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard({ stories }: { stories: StoryDTO[] }) {
    const grouped = groupStoriesByColumn(stories);

    return (
        <div
            style={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: "minmax(380px, 1fr)",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 8,
            }}
        >
            {COLUMNS.map((col) => (
                <KanbanColumn key={col.key} title={col.title} items={grouped[col.key]} />
            ))}
        </div>
    );
}