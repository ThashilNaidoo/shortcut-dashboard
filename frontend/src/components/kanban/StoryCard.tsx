import { useNavigate } from "react-router-dom";
import type { StoryDTO } from "../../api/types";

const MONO = "'Courier New', 'Courier', monospace";
const AMBER = "#f5c842";
const TEAL = "#4de0a8";
const CREAM = "#f0e8cc";

export function StoryCard({ t }: { t: StoryDTO }) {
    const navigate = useNavigate();
    const title = t.title ?? `Story ${t.id}`;
    const labels = t.labels ?? [];

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/stories/${t.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/stories/${t.id}`); }}
            style={{
                border: "1px solid rgba(245,200,66,0.18)",
                boxShadow: `inset 3px 0 0 0 ${AMBER}`,
                borderRadius: 0,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "rgba(245,200,66,0.025)",
                cursor: "pointer",
                fontFamily: MONO,
                color: CREAM,
                transition: "background 0.12s, border-color 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(245,200,66,0.06)";
                el.style.borderColor = "rgba(245,200,66,0.45)";
                el.style.boxShadow = `inset 3px 0 0 0 ${AMBER}, 0 0 16px rgba(245,200,66,0.08)`;
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(245,200,66,0.025)";
                el.style.borderColor = "rgba(245,200,66,0.18)";
                el.style.boxShadow = `inset 3px 0 0 0 ${AMBER}`;
            }}
        >
            {/* Title + ID */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35, color: CREAM }}>{title}</div>
                <div style={{ fontSize: 10, color: AMBER, opacity: 0.75, flexShrink: 0, letterSpacing: "0.06em" }}>
                    #{t.id}
                </div>
            </div>

            {/* Badges */}
            {(t.story_type || typeof t.estimate === "number" || labels.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                    {t.story_type && (
                        <span
                            style={{
                                border: `1px solid rgba(245,200,66,0.4)`,
                                borderRadius: 0,
                                padding: "2px 6px",
                                fontSize: 10,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: AMBER,
                            }}
                        >
                            {t.story_type}
                        </span>
                    )}

                    {typeof t.estimate === "number" && (
                        <span
                            style={{
                                border: `1px solid rgba(78,224,168,0.4)`,
                                borderRadius: 0,
                                padding: "2px 6px",
                                fontSize: 10,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: TEAL,
                            }}
                        >
                            EST:{t.estimate}
                        </span>
                    )}

                    {labels.slice(0, 6).map((name) => (
                        <span
                            key={name}
                            style={{
                                border: "1px solid rgba(240,232,204,0.2)",
                                borderRadius: 0,
                                padding: "2px 6px",
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "rgba(240,232,204,0.55)",
                            }}
                        >
                            {name}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {t.app_url ? (
                    <a
                        href={t.app_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: TEAL,
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textDecoration: "none",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        &gt; OPEN
                    </a>
                ) : (
                    <span style={{ opacity: 0.3, fontSize: 10, letterSpacing: "0.08em" }}>-- NO LINK --</span>
                )}

                {t.updated_at_readable && (
                    <span style={{ opacity: 0.4, fontSize: 10, letterSpacing: "0.04em" }}>
                        {t.updated_at_readable}
                    </span>
                )}
            </div>
        </div>
    );
}
