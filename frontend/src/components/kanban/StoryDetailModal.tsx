import { useEffect, useRef, useState } from "react";

// ── Local types (mirrors StoryFullDTO from backend) ──────────────────────────

interface TaskDTO {
    id: number;
    complete: boolean;
    description: string;
    position: number;
}

interface BranchDTO {
    id: number;
    name: string;
    url: string;
}

interface CommentDTO {
    id: number;
    author: string;
    created_at: string | null;
    parent_id: number | null;
    text: string | null;
}

interface CommitDTO {
    id: number;
    message: string;
    created_at: string | null;
    url: string;
}

interface PullRequestDTO {
    id: number;
    merged: boolean;
    branch_name: string;
    title: string;
    review_status: string;
    url: string;
}

interface StoryFullDTO {
    id: number;
    title: string;
    description: string;
    epic: string | null;
    app_url: string | null;

    tasks: TaskDTO[];
    branches: BranchDTO[];
    comments: CommentDTO[];
    commits: CommitDTO[];
    pull_requests: PullRequestDTO[];

    story_type: string | null;
    estimate: number | null;
    labels: string[];

    workflow_id: number | null;
    workflow_state_id: number | null;
    state_name: string | null;
    state_type: string | null;

    created_at: string | null;
    updated_at: string | null;
    updated_at_readable: string | null;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
    story: StoryFullDTO | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

// ── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "overview" | "tasks" | "git" | "comments";

const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "git", label: "Git" },
    { id: "comments", label: "Comments" },
];

// ── Component ────────────────────────────────────────────────────────────────

export function StoryDetailModal({ story, loading, error, onClose }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    // Reset tab when a new story opens
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
                                        <span className="sdm-estimate">{story.estimate} pts</span>
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
                    Open in Shortcut
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
    if (!comments || comments?.length === 0) {
        return <EmptyState icon="💬" message="No comments yet" />;
    }

    // Build thread: top-level first, then replies
    const topLevel = comments.filter((c) => c.parent_id == null);
    const replies = comments.filter((c) => c.parent_id != null);

    return (
        <div className="sdm-tab-content">
            <div className="sdm-comment-list">
                {topLevel.map((c) => (
                    <div key={c.id}>
                        <CommentItem comment={c} />
                        {replies.filter((r) => r.parent_id === c.id).map((r) => (
                            <CommentItem key={r.id} comment={r} isReply />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CommentItem({ comment, isReply = false }: { comment: CommentDTO; isReply?: boolean }) {
    const initials = comment.author.slice(0, 2).toUpperCase();
    return (
        <div className={`sdm-comment${isReply ? " sdm-comment--reply" : ""}`}>
            <div className="sdm-comment-avatar">{initials || "?"}</div>
            <div className="sdm-comment-body">
                <div className="sdm-comment-meta">
                    <span className="sdm-comment-author">{comment.author || "Unknown"}</span>
                    {comment.created_at && (
                        <span className="sdm-comment-time">{formatDate(comment.created_at)}</span>
                    )}
                </div>
                <p className="sdm-comment-text">{comment.text || <em style={{ opacity: 0.4 }}>Empty comment</em>}</p>
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

function getStateColor(stateType: string | null): string {
    switch (stateType) {
        case "started": return "#34d399";
        case "done": return "#818cf8";
        case "unstarted": return "#94a3b8";
        default: return "#64748b";
    }
}

// ── CSS ──────────────────────────────────────────────────────────────────────

const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .sdm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
        font-family: 'DM Sans', sans-serif;
    }

    .sdm-panel {
        background: #0f1117;
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 20px;
        width: 100%;
        max-width: 680px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
    }

    .sdm-close {
        position: absolute;
        top: 18px;
        right: 18px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 8px;
        cursor: pointer;
        color: rgba(255,255,255,0.5);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background 0.15s, color 0.15s;
    }
    .sdm-close:hover {
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.9);
    }

    /* ── Center states ── */
    .sdm-center-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 32px;
        gap: 8px;
        color: rgba(255,255,255,0.6);
        font-size: 14px;
    }
    .sdm-spinner {
        width: 28px;
        height: 28px;
        border: 2px solid rgba(255,255,255,0.1);
        border-top-color: rgba(255,255,255,0.5);
        border-radius: 50%;
        animation: sdm-spin 0.7s linear infinite;
    }
    @keyframes sdm-spin { to { transform: rotate(360deg); } }
    .sdm-error-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(248,113,113,0.12);
        border: 1px solid rgba(248,113,113,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f87171;
        font-weight: 700;
        font-size: 18px;
    }

    /* ── Header ── */
    .sdm-header {
        padding: 28px 28px 0;
        flex-shrink: 0;
    }
    .sdm-header-top {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    .sdm-story-id {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255,255,255,0.3);
        font-family: 'DM Mono', monospace;
        letter-spacing: 0.04em;
    }
    .sdm-type-badge {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid;
    }
    .sdm-type-badge[data-type="feature"]  { color: #60a5fa; border-color: rgba(96,165,250,0.3); background: rgba(96,165,250,0.08); }
    .sdm-type-badge[data-type="bug"]      { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
    .sdm-type-badge[data-type="chore"]    { color: #94a3b8; border-color: rgba(148,163,184,0.3); background: rgba(148,163,184,0.08); }
    .sdm-type-badge                        { color: #a78bfa; border-color: rgba(167,139,250,0.3); background: rgba(167,139,250,0.08); }

    .sdm-state-badge {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid;
    }
    .sdm-estimate {
        font-size: 11px;
        color: rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 3px 8px;
        font-family: 'DM Mono', monospace;
    }
    .sdm-title {
        font-size: 19px;
        font-weight: 700;
        line-height: 1.35;
        color: rgba(255,255,255,0.95);
        margin: 0 0 10px;
        padding-right: 36px;
    }
    .sdm-epic {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #fbbf24;
        background: rgba(251,191,36,0.08);
        border: 1px solid rgba(251,191,36,0.2);
        border-radius: 6px;
        padding: 3px 8px;
        margin-bottom: 16px;
    }

    /* ── Tab bar ── */
    .sdm-tabbar {
        display: flex;
        gap: 2px;
        padding: 0 28px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        flex-shrink: 0;
    }
    .sdm-tab {
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: rgba(255,255,255,0.4);
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.15s;
        margin-bottom: -1px;
    }
    .sdm-tab:hover { color: rgba(255,255,255,0.7); }
    .sdm-tab--active {
        color: rgba(255,255,255,0.95);
        border-bottom-color: #818cf8;
    }
    .sdm-tab-badge {
        font-size: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 999px;
        padding: 1px 6px;
        font-weight: 600;
    }
    .sdm-tab--active .sdm-tab-badge {
        background: rgba(129,140,248,0.25);
        color: #a5b4fc;
    }

    /* ── Scrollable body ── */
    .sdm-body {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    .sdm-body::-webkit-scrollbar { width: 5px; }
    .sdm-body::-webkit-scrollbar-track { background: transparent; }
    .sdm-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

    .sdm-tab-content {
        padding: 24px 28px 28px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    /* ── Sections ── */
    .sdm-section { display: flex; flex-direction: column; gap: 10px; }
    .sdm-section-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.3);
    }

    /* ── Description ── */
    .sdm-description {
        font-size: 14px;
        line-height: 1.7;
        color: rgba(255,255,255,0.7);
        margin: 0;
        white-space: pre-wrap;
    }

    /* ── Chips ── */
    .sdm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .sdm-chip {
        font-size: 12px;
        color: rgba(255,255,255,0.65);
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        padding: 3px 10px;
    }

    /* ── Detail grid ── */
    .sdm-details-grid { display: flex; flex-direction: column; gap: 8px; }
    .sdm-detail-row { display: flex; align-items: baseline; gap: 12px; }
    .sdm-detail-key {
        font-size: 12px;
        color: rgba(255,255,255,0.35);
        width: 110px;
        flex-shrink: 0;
    }
    .sdm-detail-val { font-size: 13px; color: rgba(255,255,255,0.8); }

    /* ── External link ── */
    .sdm-external-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255,255,255,0.5);
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 14px;
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
        width: fit-content;
    }
    .sdm-external-link:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
    }

    /* ── Tasks ── */
    .sdm-tasks-progress { display: flex; flex-direction: column; gap: 6px; }
    .sdm-progress-bar {
        height: 4px;
        background: rgba(255,255,255,0.08);
        border-radius: 99px;
        overflow: hidden;
    }
    .sdm-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #818cf8, #34d399);
        border-radius: 99px;
        transition: width 0.4s ease;
    }
    .sdm-progress-label { font-size: 12px; color: rgba(255,255,255,0.35); }
    .sdm-task-list { display: flex; flex-direction: column; gap: 4px; }
    .sdm-task-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 9px 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
    }
    .sdm-task-item--done .sdm-task-desc { opacity: 0.35; text-decoration: line-through; }
    .sdm-task-check {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1.5px solid rgba(255,255,255,0.2);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
    }
    .sdm-task-item--done .sdm-task-check {
        background: #34d399;
        border-color: #34d399;
        color: #0f1117;
    }
    .sdm-task-desc { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.8); }

    /* ── Git ── */
    .sdm-git-list { display: flex; flex-direction: column; gap: 4px; }
    .sdm-git-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
    }
    .sdm-git-item--link {
        text-decoration: none;
        color: inherit;
        transition: background 0.15s, border-color 0.15s;
    }
    .sdm-git-item--link:hover {
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.12);
    }
    .sdm-git-item-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .sdm-git-item-title { font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sdm-git-item-meta { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
    .sdm-mono { font-family: 'DM Mono', monospace; font-size: 12px; }
    .sdm-pr-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: #34d399;
    }
    .sdm-pr-dot--merged { background: #a78bfa; }

    /* ── Comments ── */
    .sdm-comment-list { display: flex; flex-direction: column; gap: 12px; }
    .sdm-comment {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px;
    }
    .sdm-comment--reply {
        margin-left: 24px;
        margin-top: -8px;
        background: rgba(255,255,255,0.02);
        border-top-left-radius: 4px;
    }
    .sdm-comment-avatar {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: linear-gradient(135deg, #818cf8, #34d399);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #0f1117;
        flex-shrink: 0;
    }
    .sdm-comment-body { flex: 1; min-width: 0; }
    .sdm-comment-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 5px; }
    .sdm-comment-author { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
    .sdm-comment-time { font-size: 11px; color: rgba(255,255,255,0.3); }
    .sdm-comment-text { font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.7); margin: 0; }

    /* ── Empty state ── */
    .sdm-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 48px 24px;
        color: rgba(255,255,255,0.25);
        font-size: 13px;
    }
    .sdm-empty-icon { font-size: 28px; opacity: 0.4; }
`;