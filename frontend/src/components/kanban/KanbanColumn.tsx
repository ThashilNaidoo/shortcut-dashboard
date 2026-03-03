import type { StoryDTO } from "../../api/types";
import { StoryCard } from "./StoryCard";

const MONO = "'Courier New', 'Courier', monospace";
const BLUE = "#4db8ff";

export function KanbanColumn({ title, items }: { title: string; items: StoryDTO[] }) {
    return (
        <div
            style={{
                borderTop: `2px solid ${BLUE}`,
                borderRight: "1px solid rgba(77,184,255,0.2)",
                borderBottom: "1px solid rgba(77,184,255,0.2)",
                borderLeft: "1px solid rgba(77,184,255,0.2)",
                borderRadius: 0,
                background: "rgba(77,184,255,0.015)",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 140px)",
                minHeight: 200,
                overflow: "hidden",
                fontFamily: MONO,
            }}
        >
            <div
                style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid rgba(77,184,255,0.18)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flex: "0 0 auto",
                    background: "rgba(77,184,255,0.04)",
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: BLUE,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: 11,
                        color: BLUE,
                        opacity: 0.65,
                        letterSpacing: "0.06em",
                    }}
                >
                    [{String(items.length).padStart(2, "0")}]
                </div>
            </div>

            <div
                style={{
                    padding: "10px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    overflowY: "auto",
                    flex: "1 1 auto",
                }}
            >
                {items.length === 0 ? (
                    <div
                        style={{
                            opacity: 0.3,
                            fontSize: 10,
                            fontFamily: MONO,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            paddingTop: 4,
                        }}
                    >
                        -- no records --
                    </div>
                ) : (
                    items.map((t) => <StoryCard key={t.id} t={t} />)
                )}
            </div>
        </div>
    );
}
