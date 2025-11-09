export type FeedEventType =
  | "angry_lips_published"
  | "chapter_added"
  | "story_saved"
  | "comment_added"
  | "story_branch_created"
  | "connection_accepted";

export interface FeedEvent {
  id: string;
  eventType: FeedEventType;
  createdAt: string;
  payload: Record<string, unknown>;
}


