import type { components } from "../../api/schema";

type TicketDTO = components["schemas"]["TicketDTO"];

export function TicketCard({ t }: { t: TicketDTO }) {
    const title = t.title ?? `Story ${t.id}`
    const labels = t.labels ?? [];
    const link = t.app_url ?? "";

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
                <div style={{ opacity: 0.75, fontVariantNumeric: "tabular-nums" }}>#{t.id}</div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {t.story_type && (
                    <span
                        style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        opacity: 0.9,
                        }}
                    >
                        {t.story_type}
                    </span>
                )}

                {typeof t.estimate === "number" && (
                    <span
                        style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        opacity: 0.9,
                        }}
                    >
                        Est: {t.estimate}
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

                {t.updated_at_readable ? (
                    <span style={{ opacity: 0.6, fontSize: 12 }}>
                        Updated: {t.updated_at_readable}
                    </span>
                ) : null}
            </div>
        </div>
    )
}