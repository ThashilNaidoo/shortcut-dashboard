import { useEffect, useRef, useState } from "react";
import type { StoryFullDTO, TaskDTO, BranchDTO, CommentDTO, CommitDTO, PullRequestDTO } from "../../api/types";

type TabId =
    | "overview"
    | "tasks"
    | "git"
    | "comments";

const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "git", label: "Git" },
    { id: "comments", label: "Comments" },
];

interface Props {
    story: StoryFullDTO | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

export function StoryDetailModal({ story, loading, error, onClose }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    useEffect(() => { setActiveTab("overview"); }, [story?.id]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    function handleOverlayClick(e: React.MouseEvent) {
        if (e.target === overlayRef.current) onClose();
    }

    const stateColor = story ? getStateColor(story.state_type) : "#64748b";

    return (
        <>
            <style>{css}</style>
            <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                className="sdm-overlay"
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={story ? `Story #${story.id}` : "Story detail"}
                    className="sdm-panel"
                >
                    {/* ── Close ── */}
                    <button onClick={onClose} aria-label="Close" className="sdm-close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {loading && (
                        <div className="sdm-center-state">
                            <div className="sdm-spinner" />
                            <span style={{ opacity: 0.5, marginTop: 12 }}>Loading story…</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="sdm-center-state">
                            <div className="sdm-error-icon">!</div>
                            <span style={{ color: "#f87171", marginTop: 8 }}>{error}</span>
                        </div>
                    )}

                    {story && !loading && (
                        <>
                            {/* ── Header ── */}
                            <div className="sdm-header">
                                <div className="sdm-header-top">
                                    <span className="sdm-story-id">#{story.id}</span>
                                    {story.story_type && (
                                        <span className="sdm-type-badge" data-type={story.story_type}>
                                            {story.story_type}
                                        </span>
                                    )}
                                    {story.state_name && (
                                        <span
                                            className="sdm-state-badge"
                                            style={{ background: `${stateColor}22`, borderColor: `${stateColor}55`, color: stateColor }}
                                        >
                                            {story.state_name}
                                        </span>
                                    )}
                                    {typeof story.estimate === "number" && (
                                        <span className="sdm-estimate">EST:{story.estimate}</span>
                                    )}
                                </div>
                                <h2 className="sdm-title">{story.title}</h2>
                                {story.epic && (
                                    <div className="sdm-epic">
                                        <EpicIcon />
                                        {story.epic}
                                    </div>
                                )}
                            </div>

                            {/* ── Tab bar ── */}
                            <div className="sdm-tabbar">
                                {TABS.map((t) => (
                                    <button
                                        key={t.id}
                                        className={`sdm-tab${activeTab === t.id ? " sdm-tab--active" : ""}`}
                                        onClick={() => setActiveTab(t.id)}
                                    >
                                        {t.label}
                                        {t.id === "tasks" && story.tasks && story.tasks.length > 0 && (
                                            <span className="sdm-tab-badge">{story.tasks.length}</span>
                                        )}
                                        {t.id === "git" && (story.branches && story.branches.length + story.pull_requests.length + story.commits.length) > 0 && (
                                            <span className="sdm-tab-badge">
                                                {story.branches.length + story.pull_requests.length + story.commits.length}
                                            </span>
                                        )}
                                        {t.id === "comments" && story.comments && story.comments.length > 0 && (
                                            <span className="sdm-tab-badge">{story.comments.length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* ── Tab content ── */}
                            <div className="sdm-body">
                                {activeTab === "overview" && (
                                    <OverviewTab story={story} />
                                )}
                                {activeTab === "tasks" && (
                                    <TasksTab tasks={story.tasks} />
                                )}
                                {activeTab === "git" && (
                                    <GitTab
                                        branches={story.branches}
                                        commits={story.commits}
                                        pullRequests={story.pull_requests}
                                    />
                                )}
                                {activeTab === "comments" && (
                                    <CommentsTab comments={story.comments} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function OverviewTab({ story }: { story: StoryFullDTO }) {
    return (
        <div className="sdm-tab-content">
            {story.description && (
                <Section label="Description">
                    <p className="sdm-description">{story.description}</p>
                </Section>
            )}

            {story.labels.length > 0 && (
                <Section label="Labels">
                    <div className="sdm-chips">
                        {story.labels.map((l) => (
                            <span key={l} className="sdm-chip">{l}</span>
                        ))}
                    </div>
                </Section>
            )}

            <Section label="Details">
                <div className="sdm-details-grid">
                    {story.workflow_id && (
                        <DetailRow label="Workflow ID" value={String(story.workflow_id)} />
                    )}
                    {story.workflow_state_id && (
                        <DetailRow label="State ID" value={String(story.workflow_state_id)} />
                    )}
                    {story.state_type && (
                        <DetailRow label="State Type" value={story.state_type} />
                    )}
                    {story.created_at && (
                        <DetailRow label="Created" value={formatDate(story.created_at)} />
                    )}
                    {story.updated_at_readable && (
                        <DetailRow label="Updated" value={story.updated_at_readable} />
                    )}
                </div>
            </Section>

            {story.app_url && (
                <a
                    href={story.app_url}
                    target="_blank"
                    rel="noreferrer"
                    className="sdm-external-link"
                >
                    &gt; Open in Shortcut
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </a>
            )}
        </div>
    );
}

function TasksTab({ tasks }: { tasks: TaskDTO[] }) {
    const done = tasks.filter((t) => t.complete).length;

    if (tasks.length === 0) {
        return <EmptyState icon="✓" message="No tasks on this story" />;
    }

    return (
        <div className="sdm-tab-content">
            <div className="sdm-tasks-progress">
                <div className="sdm-progress-bar">
                    <div
                        className="sdm-progress-fill"
                        style={{ width: `${(done / tasks.length) * 100}%` }}
                    />
                </div>
                <span className="sdm-progress-label">{done} / {tasks.length} complete</span>
            </div>
            <div className="sdm-task-list">
                {[...tasks].sort((a, b) => a.position - b.position).map((t) => (
                    <div key={t.id} className={`sdm-task-item${t.complete ? " sdm-task-item--done" : ""}`}>
                        <div className="sdm-task-check">
                            {t.complete && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="sdm-task-desc">{t.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GitTab({ branches, commits, pullRequests }: {
    branches: BranchDTO[];
    commits: CommitDTO[];
    pullRequests: PullRequestDTO[];
}) {
    const empty = branches.length === 0 && commits.length === 0 && pullRequests.length === 0;
    if (empty) return <EmptyState icon="⎇" message="No git activity yet" />;

    return (
        <div className="sdm-tab-content">
            {pullRequests.length > 0 && (
                <Section label={`Pull Requests (${pullRequests.length})`}>
                    <div className="sdm-git-list">
                        {pullRequests.map((pr) => (
                            <a key={pr.id} href={pr.url} target="_blank" rel="noreferrer" className="sdm-git-item sdm-git-item--link">
                                <div className="sdm-git-item-left">
                                    <span className={`sdm-pr-dot${pr.merged ? " sdm-pr-dot--merged" : ""}`} />
                                    <div>
                                        <div className="sdm-git-item-title">{pr.title}</div>
                                        <div className="sdm-git-item-meta">{pr.branch_name} · {pr.review_status}</div>
                                    </div>
                                </div>
                                <ExternalIcon />
                            </a>
                        ))}
                    </div>
                </Section>
            )}

            {branches.length > 0 && (
                <Section label={`Branches (${branches.length})`}>
                    <div className="sdm-git-list">
                        {branches.map((b) => (
                            <a key={b.id} href={b.url} target="_blank" rel="noreferrer" className="sdm-git-item sdm-git-item--link">
                                <div className="sdm-git-item-left">
                                    <BranchIcon />
                                    <span className="sdm-git-item-title sdm-mono">{b.name}</span>
                                </div>
                                <ExternalIcon />
                            </a>
                        ))}
                    </div>
                </Section>
            )}

            {commits.length > 0 && (
                <Section label={`Commits (${commits.length})`}>
                    <div className="sdm-git-list">
                        {commits.map((c) => (
                            <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="sdm-git-item sdm-git-item--link">
                                <div className="sdm-git-item-left">
                                    <CommitIcon />
                                    <div>
                                        <div className="sdm-git-item-title">{c.message}</div>
                                        {c.created_at && (
                                            <div className="sdm-git-item-meta">{formatDate(c.created_at)}</div>
                                        )}
                                    </div>
                                </div>
                                <ExternalIcon />
                            </a>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

function CommentsTab({ comments }: { comments: CommentDTO[] }) {
    const [draft, setDraft] = useState("");

    const topLevel = (comments ?? []).filter((c) => c.parent_id == null);
    const getReplies = (parentId: number) => (comments ?? []).filter((c) => c.parent_id === parentId);

    function handleSubmit() {
        // TODO: wire up to backend
        console.log("submit comment:", draft);
    }

    return (
        <div className="sdm-tab-content">
            {/* Input */}
            <div className="sdm-comment-compose">
                <textarea
                    className="sdm-comment-input"
                    placeholder="> ADD COMMENT..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                />
                <div className="sdm-comment-compose-footer">
                    <button
                        className="sdm-comment-submit"
                        onClick={handleSubmit}
                        disabled={!draft.trim()}
                    >
                        &gt; SUBMIT
                    </button>
                </div>
            </div>

            {/* List */}
            {comments && comments.length > 0 ? (
                <>
                    <div className="sdm-comments-header">
                        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
                    </div>
                    <div className="sdm-comment-list">
                        {topLevel.map((c) => (
                            <CommentThread key={c.id} comment={c} replies={getReplies(c.id)} />
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState icon="💬" message="No comments yet" />
            )}
        </div>
    );
}

function CommentThread({ comment, replies }: { comment: CommentDTO; replies: CommentDTO[] }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="sdm-comment-thread">
            <CommentItem comment={comment} />
            {replies.length > 0 && (
                <div className="sdm-replies-section">
                    <button className="sdm-replies-toggle" onClick={() => setExpanded(!expanded)}>
                        <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            className={`sdm-replies-toggle-icon${expanded ? " sdm-replies-toggle-icon--expanded" : ""}`}
                        >
                            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {expanded ? "Hide replies" : `View ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
                    </button>
                    {expanded && (
                        <div className="sdm-replies-list">
                            {replies.map((r) => (
                                <CommentItem key={r.id} comment={r} isReply />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CommentItem({ comment, isReply = false }: { comment: CommentDTO; isReply?: boolean }) {
    const initials = comment.author
        ? comment.author
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word[0])
            .join("")
            .toUpperCase()
        : "?";
    return (
        <div className="sdm-comment">
            <div className={`sdm-comment-avatar${isReply ? " sdm-comment-avatar--small" : ""}`}>{initials}</div>
            <div className="sdm-comment-body">
                <div className="sdm-comment-meta">
                    <span className="sdm-comment-author">{comment.author || "Unknown"}</span>
                    {comment.created_at && (
                        <span className="sdm-comment-time">{formatRelativeTime(comment.created_at)}</span>
                    )}
                </div>
                <p className="sdm-comment-text">
                    {comment.text
                        ? comment.text.split(/(@\w+)/g).map((part, i) =>
                            part.startsWith("@")
                                ? <strong key={i} className="sdm-comment-mention">{part}</strong>
                                : part
                          )
                        : <em style={{ opacity: 0.4 }}>Empty comment</em>
                    }
                </p>
            </div>
        </div>
    );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="sdm-section">
            <div className="sdm-section-label">{label}</div>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="sdm-detail-row">
            <span className="sdm-detail-key">{label}</span>
            <span className="sdm-detail-val">{value}</span>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="sdm-empty">
            <span className="sdm-empty-icon">{icon}</span>
            <span>{message}</span>
        </div>
    );
}

// ── Tiny icons ───────────────────────────────────────────────────────────────

function EpicIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M6 1l1.5 3.5H11L8.5 7l1 3.5L6 8.5 2.5 10.5l1-3.5L1 4.5h3.5z" fill="currentColor" opacity="0.7" />
        </svg>
    );
}

function ExternalIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
            <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BranchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
            <circle cx="3" cy="3" r="1.5" fill="currentColor" />
            <circle cx="3" cy="11" r="1.5" fill="currentColor" />
            <circle cx="11" cy="3" r="1.5" fill="currentColor" />
            <path d="M3 4.5v5M3 4.5C3 7 5 8 7 8h2a2 2 0 002-2V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function CommitIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
            <circle cx="7" cy="7" r="2.5" fill="currentColor" />
            <line x1="1" y1="7" x2="4" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="10" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function formatRelativeTime(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? "s" : ""} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
    return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
}

function getStateColor(stateType: string | null): string {
    switch (stateType) {
        case "started": return "#34d399";
        case "done": return "#4db8ff";
        case "unstarted": return "#94a3b8";
        default: return "#64748b";
    }
}

// ── CSS ──────────────────────────────────────────────────────────────────────

const css = `
    .sdm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.82);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
        font-family: 'Courier New', 'Courier', monospace;
    }

    .sdm-panel {
        background: #111d2e;
        border-top: 2px solid #4db8ff;
        border-right: 1px solid rgba(77,184,255,0.22);
        border-bottom: 1px solid rgba(77,184,255,0.22);
        border-left: 1px solid rgba(77,184,255,0.22);
        border-radius: 0;
        width: 100%;
        max-width: 680px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 48px rgba(77,184,255,0.07), 0 24px 64px rgba(0,0,0,0.75);
    }

    .sdm-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(77,184,255,0.06);
        border: 1px solid rgba(77,184,255,0.22);
        border-radius: 0;
        cursor: pointer;
        color: rgba(77,184,255,0.55);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background 0.12s, color 0.12s;
    }
    .sdm-close:hover {
        background: rgba(77,184,255,0.14);
        color: #4db8ff;
    }

    /* ── Center states ── */
    .sdm-center-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 32px;
        gap: 10px;
        color: rgba(77,184,255,0.7);
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }
    .sdm-spinner {
        width: 26px;
        height: 26px;
        border: 2px solid rgba(77,184,255,0.12);
        border-top-color: #4db8ff;
        border-radius: 0;
        animation: sdm-spin 0.8s linear infinite;
    }
    @keyframes sdm-spin { to { transform: rotate(360deg); } }
    .sdm-error-icon {
        width: 34px;
        height: 34px;
        border-radius: 0;
        background: rgba(248,113,113,0.08);
        border: 1px solid rgba(248,113,113,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f87171;
        font-weight: 700;
        font-size: 16px;
    }

    /* ── Header ── */
    .sdm-header {
        padding: 20px 20px 0;
        flex-shrink: 0;
        background: rgba(77,184,255,0.02);
        border-bottom: 1px solid rgba(77,184,255,0.12);
    }
    .sdm-header-top {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    .sdm-story-id {
        font-size: 13px;
        font-weight: 700;
        color: #4db8ff;
        letter-spacing: 0.1em;
    }
    .sdm-type-badge {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 0;
        border: 1px solid;
    }
    .sdm-type-badge[data-type="feature"] { color: #4db8ff; border-color: rgba(77,184,255,0.4); background: rgba(77,184,255,0.06); }
    .sdm-type-badge[data-type="bug"]     { color: #f87171; border-color: rgba(248,113,113,0.4); background: rgba(248,113,113,0.06); }
    .sdm-type-badge[data-type="chore"]   { color: rgba(240,232,204,0.7); border-color: rgba(240,232,204,0.3); background: transparent; }
    .sdm-type-badge                       { color: #4db8ff; border-color: rgba(77,184,255,0.4); background: rgba(77,184,255,0.06); }

    .sdm-state-badge {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 0;
        border: 1px solid;
    }
    .sdm-estimate {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #4de0a8;
        background: rgba(77,224,168,0.06);
        border: 1px solid rgba(77,224,168,0.28);
        border-radius: 0;
        padding: 2px 6px;
    }
    .sdm-title {
        font-size: 17px;
        font-weight: 700;
        line-height: 1.45;
        color: #f0e8cc;
        margin: 0 0 12px;
        padding-right: 36px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }
    .sdm-epic {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #4db8ff;
        background: rgba(77,184,255,0.06);
        border: 1px solid rgba(77,184,255,0.22);
        border-radius: 0;
        padding: 3px 8px;
        margin-bottom: 12px;
    }

    /* ── Tab bar ── */
    .sdm-tabbar {
        display: flex;
        gap: 0;
        padding: 0 20px;
        border-bottom: 1px solid rgba(77,184,255,0.15);
        flex-shrink: 0;
        background: rgba(77,184,255,0.01);
    }
    .sdm-tab {
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: rgba(77,184,255,0.6);
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.13em;
        text-transform: uppercase;
        cursor: pointer;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.12s;
        margin-bottom: -1px;
    }
    .sdm-tab:hover { color: rgba(77,184,255,0.9); }
    .sdm-tab--active {
        color: #4db8ff;
        border-bottom-color: #4db8ff;
    }
    .sdm-tab-badge {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        background: rgba(77,184,255,0.1);
        border: 1px solid rgba(77,184,255,0.2);
        border-radius: 0;
        padding: 0 4px;
    }
    .sdm-tab--active .sdm-tab-badge {
        background: rgba(77,184,255,0.2);
        border-color: rgba(77,184,255,0.45);
        color: #4db8ff;
    }

    /* ── Scrollable body ── */
    .sdm-body {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    .sdm-body::-webkit-scrollbar { width: 3px; }
    .sdm-body::-webkit-scrollbar-track { background: transparent; }
    .sdm-body::-webkit-scrollbar-thumb { background: rgba(77,184,255,0.2); border-radius: 0; }

    .sdm-tab-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    /* ── Sections ── */
    .sdm-section { display: flex; flex-direction: column; gap: 10px; }
    .sdm-section-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #4db8ff;
        opacity: 0.85;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(77,184,255,0.12);
    }

    /* ── Description ── */
    .sdm-description {
        font-size: 13px;
        line-height: 1.8;
        color: rgba(240,232,204,0.9);
        margin: 0;
        white-space: pre-wrap;
        letter-spacing: 0.02em;
    }

    /* ── Chips ── */
    .sdm-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .sdm-chip {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(240,232,204,0.78);
        background: transparent;
        border: 1px solid rgba(240,232,204,0.18);
        border-radius: 0;
        padding: 2px 6px;
    }

    /* ── Detail grid ── */
    .sdm-details-grid { display: flex; flex-direction: column; gap: 6px; }
    .sdm-detail-row { display: flex; align-items: baseline; gap: 12px; }
    .sdm-detail-key {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(77,184,255,0.72);
        width: 110px;
        flex-shrink: 0;
    }
    .sdm-detail-val {
        font-size: 13px;
        color: rgba(240,232,204,0.92);
        letter-spacing: 0.03em;
    }

    /* ── External link ── */
    .sdm-external-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #4de0a8;
        background: transparent;
        border: 1px solid rgba(77,224,168,0.3);
        border-radius: 0;
        padding: 6px 12px;
        text-decoration: none;
        transition: background 0.12s, border-color 0.12s;
        width: fit-content;
    }
    .sdm-external-link:hover {
        background: rgba(77,224,168,0.06);
        border-color: rgba(77,224,168,0.55);
    }

    /* ── Tasks ── */
    .sdm-tasks-progress { display: flex; flex-direction: column; gap: 6px; }
    .sdm-progress-bar {
        height: 3px;
        background: rgba(77,184,255,0.1);
        border-radius: 0;
        overflow: hidden;
    }
    .sdm-progress-fill {
        height: 100%;
        background: #4db8ff;
        border-radius: 0;
        transition: width 0.4s ease;
    }
    .sdm-progress-label {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(77,184,255,0.7);
    }
    .sdm-task-list { display: flex; flex-direction: column; gap: 3px; }
    .sdm-task-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 10px;
        background: rgba(77,184,255,0.02);
        border: 1px solid rgba(77,184,255,0.12);
        border-radius: 0;
        box-shadow: inset 3px 0 0 0 rgba(77,184,255,0.28);
    }
    .sdm-task-item--done {
        box-shadow: inset 3px 0 0 0 #4de0a8;
    }
    .sdm-task-item--done .sdm-task-desc { opacity: 0.3; text-decoration: line-through; }
    .sdm-task-check {
        width: 14px;
        height: 14px;
        border-radius: 0;
        border: 1px solid rgba(77,184,255,0.35);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
    }
    .sdm-task-item--done .sdm-task-check {
        background: #4de0a8;
        border-color: #4de0a8;
        color: #050e08;
    }
    .sdm-task-desc {
        font-size: 13px;
        line-height: 1.6;
        color: rgba(240,232,204,0.92);
        letter-spacing: 0.02em;
    }

    /* ── Git ── */
    .sdm-git-list { display: flex; flex-direction: column; gap: 3px; }
    .sdm-git-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 10px;
        background: rgba(77,184,255,0.02);
        border: 1px solid rgba(77,184,255,0.12);
        border-radius: 0;
        box-shadow: inset 3px 0 0 0 rgba(77,184,255,0.28);
    }
    .sdm-git-item--link {
        text-decoration: none;
        color: inherit;
        transition: background 0.12s, border-color 0.12s;
    }
    .sdm-git-item--link:hover {
        background: rgba(77,184,255,0.05);
        border-color: rgba(77,184,255,0.3);
    }
    .sdm-git-item-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .sdm-git-item-title {
        font-size: 13px;
        color: rgba(240,232,204,0.92);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.02em;
    }
    .sdm-git-item-meta {
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(77,184,255,0.65);
        margin-top: 2px;
    }
    .sdm-mono { font-family: 'Courier New', 'Courier', monospace; font-size: 13px; }
    .sdm-pr-dot {
        width: 6px;
        height: 6px;
        border-radius: 0;
        flex-shrink: 0;
        background: #4de0a8;
    }
    .sdm-pr-dot--merged { background: #4db8ff; }

    /* ── Comment compose ── */
    .sdm-comment-compose {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid rgba(77,184,255,0.25);
        border-radius: 0;
        box-shadow: inset 3px 0 0 0 #4db8ff;
    }
    .sdm-comment-input {
        background: rgba(77,184,255,0.03);
        border: none;
        border-bottom: 1px solid rgba(77,184,255,0.15);
        border-radius: 0;
        color: #f0e8cc;
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 13px;
        line-height: 1.6;
        letter-spacing: 0.02em;
        padding: 10px 12px;
        resize: none;
        width: 100%;
        box-sizing: border-box;
        outline: none;
        transition: background 0.12s;
    }
    .sdm-comment-input::placeholder {
        color: rgba(77,184,255,0.3);
        letter-spacing: 0.1em;
    }
    .sdm-comment-input:focus {
        background: rgba(77,184,255,0.06);
    }
    .sdm-comment-compose-footer {
        display: flex;
        justify-content: flex-end;
        padding: 6px 8px;
        background: rgba(77,184,255,0.02);
    }
    .sdm-comment-submit {
        background: transparent;
        border: 1px solid rgba(77,184,255,0.35);
        border-radius: 0;
        color: #4db8ff;
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 5px 14px;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s, color 0.12s;
    }
    .sdm-comment-submit:hover:not(:disabled) {
        background: rgba(77,184,255,0.1);
        border-color: #4db8ff;
        color: #7ecfff;
    }
    .sdm-comment-submit:disabled {
        opacity: 0.3;
        cursor: default;
    }

    /* ── Comments ── */
    .sdm-comments-header {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #4db8ff;
        padding-bottom: 12px;
        margin-bottom: 4px;
        border-bottom: 1px solid rgba(77,184,255,0.15);
    }
    .sdm-comment-list { display: flex; flex-direction: column; gap: 0; }
    .sdm-comment-thread {
        padding: 10px 0;
        border-bottom: 1px solid rgba(77,184,255,0.07);
    }
    .sdm-comment { display: flex; gap: 10px; }
    .sdm-comment-avatar {
        width: 28px;
        height: 28px;
        border-radius: 0;
        background: rgba(77,184,255,0.1);
        border: 1px solid rgba(77,184,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #4db8ff;
        flex-shrink: 0;
    }
    .sdm-comment-avatar--small {
        width: 20px;
        height: 20px;
        font-size: 9px;
    }
    .sdm-comment-body { flex: 1; min-width: 0; }
    .sdm-comment-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
    .sdm-comment-author {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #4db8ff;
    }
    .sdm-comment-time {
        font-size: 11px;
        letter-spacing: 0.05em;
        color: rgba(77,184,255,0.6);
    }
    .sdm-comment-text {
        font-size: 13px;
        line-height: 1.7;
        color: rgba(240,232,204,0.88);
        margin: 0;
        letter-spacing: 0.02em;
    }
    .sdm-comment-mention { font-weight: 700; color: #4db8ff; }
    .sdm-replies-section { margin-left: 38px; margin-top: 6px; }
    .sdm-replies-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: rgba(77,184,255,0.75);
        font-family: 'Courier New', 'Courier', monospace;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        padding: 4px 0;
        transition: color 0.12s;
    }
    .sdm-replies-toggle:hover { color: #7ecfff; }
    .sdm-replies-toggle-icon { transition: transform 0.2s ease; }
    .sdm-replies-toggle-icon--expanded { transform: rotate(180deg); }
    .sdm-replies-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

    /* ── Empty state ── */
    .sdm-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 40px 24px;
        color: rgba(77,184,255,0.5);
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }
    .sdm-empty-icon { font-size: 24px; opacity: 0.45; }
`;