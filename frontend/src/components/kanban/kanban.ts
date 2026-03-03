import type { StoryDTO } from "../../api/types";

export type ColumnKey =
    | "todo"
    | "in_progress"
    | "ur_merging"
    | "ur_staging"
    | "ready_deploy"
    | "done"
    | "other";

export const COLUMNS: { key: ColumnKey; title: string }[] = [
    { key: "todo", title: "To Do" },
    { key: "in_progress", title: "In Progress" },
    { key: "ur_merging", title: "Under Review in Merging" },
    { key: "ur_staging", title: "Under Review in Staging" },
    { key: "ready_deploy", title: "Ready for Deployment" },
    { key: "done", title: "Done" },
    { key: "other", title: "Other" },
];

export function columnForStateName(
    stateName?: string | null,
    stateType?: string | null,
): ColumnKey {
    const s = (stateName ?? "").trim().toLowerCase();

    if (!s) return "other";

    // To Do
    if (["todo", "to do", "unstarted", "backlog"].includes(s)) return "todo";

    // In Progress
    if (["in progress", "started", "doing", "dev", "development"].includes(s))
        return "in_progress";

    // Under Review in Merging
    if (s.includes("merge") || s.includes("merging")) return "ur_merging";

    // Under Review in Staging
    if (s.includes("staging")) return "ur_staging";

    // Ready for Deployment
    if (
        [
            "ready for deployment",
            "ready to deploy",
            "ready",
            "deploy",
            "deployment",
        ].includes(s) ||
        (s.includes("ready") && s.includes("deploy"))
    )
        return "ready_deploy";

    // A generic "review" that doesn't match
    if (s.includes("review")) return "other";

    // Done
    if (stateType === "done" || s === "done") return "done";

    return "other";
}

export function groupStoriesByColumn(stories: StoryDTO[]) {
    const grouped: Record<ColumnKey, StoryDTO[]> = {
        todo: [],
        in_progress: [],
        ur_merging: [],
        ur_staging: [],
        ready_deploy: [],
        done: [],
        other: [],
    };

    for (const t of stories)
        grouped[columnForStateName(t.state_name, t.state_type)].push(t);

    return grouped;
}
