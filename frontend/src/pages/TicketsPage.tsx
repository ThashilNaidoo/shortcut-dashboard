import { useEffect, useMemo, useState, useRef } from "react";
import type { components } from "../api/schema";

type TicketDTO = components["schemas"]["TicketDTO"]
type TicketListResponse = components["schemas"]["TicketListResponse"]

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const OWNER = "thashilnaidoo";

function TicketCard({ story }: { story: TicketDTO }) {
    const title = story.title ?? `Story ${story.id}`
    const labels = story.labels ?? [];
    const link = story.app_url ?? "";

    return (
        <div
            style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 700, lineHeight: 1.25 }}>{title}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {story.state_name && (
                        <span
                            style={{
                                border: "1px solid rgba(255,255,255,0.18)",
                                padding: "4px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                opacity: 0.9,
                            }}
                        >
                            {story.state_name}
                        </span>
                    )}

                    <div style={{ opacity: 0.75, fontVariantNumeric: "tabular-nums" }}>
                        #{story.id}
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {story.story_type && (
                    <span
                        style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        opacity: 0.9,
                        }}
                    >
                        {story.story_type}
                    </span>
                )}

                {typeof story.estimate === "number" && (
                    <span
                        style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        opacity: 0.9,
                        }}
                    >
                        Est: {story.estimate}
                    </span>
                )}

                {labels.slice(0, 6).map((name) => (
                    <span
                        key={name}
                        style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        opacity: 0.9,
                        }}
                    >
                        {name}
                    </span>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {link ? (
                    <a href={link} target="_blank" rel="noreferrer" style={{ opacity: 0.9 }}>
                        Open in Shortcut
                    </a>
                ) : (
                    <span style={{ opacity: 0.6 }}>No link</span>
                )}

                {story.updated_at ? (
                    <span style={{ opacity: 0.6, fontSize: 12 }}>
                        Updated: {story.updated_at_readable}
                    </span>
                ) : null}
            </div>
        </div>
    )
}

export default function TicketsPage() {
    const didLoadRef = useRef(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [next, setNext] = useState<string | null>(null);

    const endpointBase = useMemo(() => {
        return `${API_BASE}/api/v1/shortcut/stories`;
    }, []);

    async function loadFirstPage() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${endpointBase}?owner=${OWNER}&page_size=25`);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
            const json = (await res.json()) as TicketListResponse;

            setTickets(json.data ?? []);
            setNext((json.next ?? null) as string | null);
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
            // backend expects next_path as `next` query param
            const url = `${endpointBase}?page_size=25&next=${encodeURIComponent(next)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
            const json = (await res.json()) as TicketListResponse;

            setTickets((prev) => [...prev, ...(json.data ?? [])]);
            setNext((json.next ?? null) as string | null);
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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 16 }}>
            <h1 style={{ margin: 0 }}>Tickets</h1>

            <div style={{ opacity: 0.7 }}>
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
                {next ? " (more available)" : ""}
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

            {loading && <div>Loading...</div>}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 12,
                }}
            >
                {tickets.map((t) => (
                    <TicketCard key={t.id} story={t} />
                ))}
            </div>

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