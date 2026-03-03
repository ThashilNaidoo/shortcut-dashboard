export type StoryDTO = {
    id: number;
    title: string;
    app_url?: string | null;
    story_type?: string | null;
    estimate?: number | null;
    labels?: string[];
    workflow_id?: number | null;
    workflow_state_id?: number | null;
    state_name?: string | null;
    state_type?: string | null;
    updated_at?: string | null;
    updated_at_readable?: string | null;
};

export type TaskDTO = {
    id: number;
    complete: boolean;
    description: string;
    position: number;
};

export type BranchDTO = {
    id: number;
    name: string;
    url: string;
};

export type CommentDTO = {
    id: number;
    author: string;
    created_at: string | null;
    parent_id: number | null;
    text: string | null;
};

export type CommitDTO = {
    id: number;
    message: string;
    created_at: string | null;
    url: string;
};

export type PullRequestDTO = {
    id: number;
    merged: boolean;
    branch_name: string;
    title: string;
    review_status: string;
    url: string;
};

export type StoryFullDTO = {
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
};
