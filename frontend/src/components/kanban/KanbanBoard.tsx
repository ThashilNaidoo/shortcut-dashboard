import type { components } from "../../api/schema";

import { COLUMNS, groupTicketsByColumn } from "./kanban";
import { KanbanColumn } from "./KanbanColumn";

type TicketDTO = components["schemas"]["TicketDTO"];

export function KanbanBoard({ tickets }: { tickets: TicketDTO[] }) {
    const grouped = groupTicketsByColumn(tickets);

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