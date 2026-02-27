import { useEffect, useRef } from "react";
import type { components } from "../../api/schema";

type StoryDTO = components["schemas"]["StoryDTO"];

interface Props {
    story: StoryDTO | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

export function StoryDetailModal({ story, loading, error, onClose }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    function handleOverlayClick(e: React.MouseEvent) {
        if (e.target === overlayRef.current) onClose();
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 24,
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={story ? `Story #${story.id}` : "Story detail"}
                style={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 16,
                    padding: 32,
                    width: "100%",
                    maxWidth: 640,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    position: "relative",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 22,
                        lineHeight: 1,
                        padding: 4,
                    }}
                >
                    ✕
                </button>

                {loading && (
                    <div style={{ opacity: 0.6, textAlign: "center", padding: 40 }}>Loading…</div>
                )}

                {error && (
                    <div style={{ color: "#f87171", textAlign: "center", padding: 40 }}>
                        {error}
                    </div>
                )}

                {story && !loading && (
                    <>
                        {/* Header */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 32 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
                                    {story.title}
                                </div>
                            </div>
                            <div style={{ opacity: 0.55, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", paddingTop: 2 }}>
                                #{story.id}
                            </div>
                        </div>

                        {/* Meta pills */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {story.story_type && <Pill>{story.story_type}</Pill>}
                            {story.state_name && <Pill>{story.state_name}</Pill>}
                            {typeof story.estimate === "number" && (
                                <Pill>Estimate: {story.estimate}</Pill>
                            )}
                        </div>

                        {/* Labels */}
                        {story.labels && story.labels.length > 0 && (
                            <div>
                                <SectionLabel>Labels</SectionLabel>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                                    {story.labels.map((l) => (
                                        <Pill key={l}>{l}</Pill>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Workflow info */}
                        {(story.workflow_id || story.workflow_state_id) && (
                            <div style={{ display: "flex", gap: 24 }}>
                                {story.workflow_id && (
                                    <div>
                                        <SectionLabel>Workflow ID</SectionLabel>
                                        <div style={{ marginTop: 4 }}>{story.workflow_id}</div>
                                    </div>
                                )}
                                {story.workflow_state_id && (
                                    <div>
                                        <SectionLabel>State ID</SectionLabel>
                                        <div style={{ marginTop: 4 }}>{story.workflow_state_id}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Updated at */}
                        {story.updated_at_readable && (
                            <div>
                                <SectionLabel>Last Updated</SectionLabel>
                                <div style={{ marginTop: 4, opacity: 0.8 }}>{story.updated_at_readable}</div>
                            </div>
                        )}

                        {/* External link */}
                        {story.app_url && (
                            <div>
                                <a
                                    href={story.app_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "8px 18px",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        borderRadius: 8,
                                        textDecoration: "none",
                                        color: "inherit",
                                        fontSize: 14,
                                    }}
                                >
                                    Open in Shortcut ↗
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                opacity: 0.9,
            }}
        >
            {children}
        </span>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5 }}>
            {children}
        </div>
    );
}