import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import type { components } from "../api/schema";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { StoryDetailModal } from "../components/kanban/StoryDetailModal";
import { fetchStories, fetchStoryById } from "../api/shortcut";

type StoryDTO = components["schemas"]["StoryDTO"];

export default function StoryPage() {
    const navigate = useNavigate();
    const { storyId } = useParams<{ storyId?: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stories, setStories] = useState<StoryDTO[]>([]);
    const [next, setNext] = useState<string | null>(null);

    const [modalStory, setModalStory] = useState<StoryDTO | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const didLoadRef = useRef(false);

    async function loadFirstPage() {
        setLoading(true);
        setError(null);
        setStories([]);
        setNext(null);

        try {
            const json = await fetchStories({ pageSize: 100 });
            setStories(json.data ?? []);
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
            const json = await fetchStories({ pageSize: 100, next });
            setStories((prev) => [...prev, ...(json.data ?? [])]);
            setNext(json.next ?? null);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!storyId) {
            setModalStory(null);
            setModalError(null);
            return;
        }

        const id = parseInt(storyId, 10);
        if (isNaN(id)) {
            setModalError("Invalid story ID");
            return;
        }

        const cached = stories.find((s) => s.id === id);
        if (cached) {
            setModalStory(cached);
            setModalError(null);
            return;
        }

        setModalLoading(true);
        setModalError(null);
        setModalStory(null);

        fetchStoryById(id)
            .then((s) => setModalStory(s))
            .catch((e: any) => setModalError(e?.message ?? "Failed to load story"))
            .finally(() => setModalLoading(false));
    }, [storyId, stories]);

    const handleCloseModal = useCallback(() => {
        navigate("/stories");
    }, [navigate]);

    const isModalOpen = Boolean(storyId);

    useEffect(() => {
        if (didLoadRef.current) return;
        didLoadRef.current = true;
        loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Stories</h1>
                <div style={{ opacity: 0.7 }}>
                {stories.length} {stories.length === 1 ? "story" : "stories"}
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

            <KanbanBoard stories={stories} />

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

            {isModalOpen && (
                <StoryDetailModal
                    story={modalStory}
                    loading={modalLoading}
                    error={modalError}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}