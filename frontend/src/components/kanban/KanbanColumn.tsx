import type { components } from "../../api/schema";
import { TicketCard } from "./TicketCard";

type TicketDTO = components["schemas"]["TicketDTO"];

export function KanbanColumn({ title, items }: { title: string; items: TicketDTO[] }) {
    return (
        <div
            style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 140px)",
                minHeight: 200,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                padding: "12px 12px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flex: "0 0 auto",
                }}
            >
                <div style={{ fontWeight: 800 }}>{title}</div>
                <div style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{items.length}</div>
            </div>

            <div
                style={{
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflowY: "auto",
                flex: "1 1 auto",
                }}
            >
                {items.length === 0 ? (
                    <div style={{ opacity: 0.6, fontSize: 13 }}>No tickets</div>
                ) : (
                    items.map((t) => <TicketCard key={t.id} t={t} />)
                )}
            </div>
        </div>
    );
}