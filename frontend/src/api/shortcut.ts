import type { StoryDTO, StoryFullDTO } from "./types";

type StoryListResponse = {
    data: StoryDTO[];
    next?: string | null;
    total?: number | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const OWNER = import.meta.env.VITE_SHORTCUT_OWNER as string;

const ENDPOINT_BASE = `${API_BASE}/api/v1/shortcut/stories`;

export async function fetchStories(params?: {
    pageSize?: number;
    next?: string | null;
}) {
    const pageSize = params?.pageSize ?? 100;

    const url = new URL(ENDPOINT_BASE);
    url.searchParams.set("page_size", String(pageSize));
    url.searchParams.set("owner", String(OWNER));

    if (params?.next) url.searchParams.set("next", params.next);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

    return (await res.json()) as StoryListResponse;
}

export async function fetchStoryById(storyId: number): Promise<StoryFullDTO> {
    const res = await fetch(`${ENDPOINT_BASE}/${storyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

    return (await res.json()) as StoryFullDTO;
}
