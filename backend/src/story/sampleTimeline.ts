export interface StoryTimelineNode {
  id: string;
  parentId?: string;
  title: string;
  author: string;
  createdAt: string;
  status: "canon" | "fan" | "draft";
}

const SAMPLE_TIMELINES: Record<string, StoryTimelineNode[]> = {
  "city-of-thousand-codes": [
    {
      id: "root",
      title: "Neon Reverie",
      author: "@kyotoSignal",
      createdAt: "Core",
      status: "canon",
    },
    {
      id: "branch-1",
      parentId: "root",
      title: "Aurora Heist",
      author: "@vectorflux",
      createdAt: "+2 days",
      status: "canon",
    },
    {
      id: "branch-2",
      parentId: "branch-1",
      title: "Aurora Heist: Divergence",
      author: "@ghostline",
      createdAt: "+3 days",
      status: "fan",
    },
    {
      id: "branch-hijack",
      parentId: "branch-1",
      title: "Hijack Protocol",
      author: "@reader42",
      createdAt: "Hijacked today",
      status: "draft",
    },
  ],
};

export function getSampleTimeline(worldId: string): StoryTimelineNode[] {
  return SAMPLE_TIMELINES[worldId] ?? SAMPLE_TIMELINES["city-of-thousand-codes"];
}

