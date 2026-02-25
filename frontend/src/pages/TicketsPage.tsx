import { useEffect, useState, useRef } from "react";
import type { components } from "../api/schema";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { fetchTickets } from "../api/shortcut";

type TicketDTO = components["schemas"]["TicketDTO"];

export default function TicketsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [next, setNext] = useState<string | null>(null);

    const didLoadRef = useRef(false);

    async function loadFirstPage() {
        setLoading(true);
        setError(null);
        setTickets([]);
        setNext(null);

        try {
            const json = await fetchTickets({ pageSize: 100 });
            setTickets(json.data ?? []);
            setNext(json.next ?? null);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function loadMore() {
        if (!next) return;

        setLoading(true);
        setError(null);

        try {
            const json = await fetchTickets({ pageSize: 100, next });
            setTickets((prev) => [...prev, ...(json.data ?? [])]);
            setNext(json.next ?? null);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (didLoadRef.current) return;
        didLoadRef.current = true;
        loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Tickets</h1>
                <div style={{ opacity: 0.7 }}>
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
                {next ? " (more available)" : ""}
                {loading ? " · Loading..." : ""}
                </div>
            </div>

            {error && (
                <div
                style={{
                    border: "1px solid rgba(255,0,0,0.35)",
                    background: "rgba(255,0,0,0.08)",
                    borderRadius: 12,
                    padding: 12,
                    whiteSpace: "pre-wrap",
                }}
                >
                {error}
                </div>
            )}

            <KanbanBoard tickets={tickets} />

            {next && (
                <button
                onClick={loadMore}
                disabled={loading}
                style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.08)",
                    color: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    width: "fit-content",
                }}
                >
                Load more
                </button>
            )}
        </div>
    );
}