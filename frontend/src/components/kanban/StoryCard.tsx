import { useNavigate } from "react-router-dom";
import type { components } from "../../api/schema";

type StoryDTO = components["schemas"]["StoryDTO"];

export function StoryCard({ t }: { t: StoryDTO }) {
    const navigate = useNavigate();
    const title = t.title ?? `Story ${t.id}`
    const labels = t.labels ?? [];

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/stories/${t.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/stories/${t.id}`); }}
            style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)";
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
                {t.app_url ? (
                    <a
                        href={t.app_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ opacity: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open in Shortcut
                    </a>
                ) : (
                    <span style={{ opacity: 0.6 }}>No link</span>
                )}

                {t.updated_at_readable && (
                    <span style={{ opacity: 0.55, fontSize: 12 }}>{t.updated_at_readable}</span>
                )}
            </div>
        </div>
    )
}