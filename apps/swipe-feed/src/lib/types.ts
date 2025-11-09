export interface AngryLipsTurnResponse {
  id: string;
  sessionId: string;
  orderIndex: number;
  status: "pending" | "submitted" | "auto_filled";
  prompt: string | null;
  partOfSpeech: string | null;
  creativeNudge: string | null;
  placeholder: string | null;
  assignedHandle: string | null;
  assignedChannel: string | null;
  responseWindowMinutes: number | null;
  dueAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  submittedText: string | null;
  submissionHandle: string | null;
  autoFilled: boolean;
  autoFillText: string | null;
  reactions: Array<{ emoji: string; count: number }>;
  createdAt: string;
  events?: AngryLipsTurnEventResponse[];
}

export interface AngryLipsTurnEventResponse {
  id: string;
  turnId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AngryLipsParticipantResponse {
  id: string;
  sessionId: string;
  userId: string;
  handle: string | null;
  role: "host" | "player";
  status: "invited" | "accepted" | "declined" | "left";
  createdAt: string;
  updatedAt: string | null;
}

export interface AngryLipsSessionResponse {
  session: {
    id: string;
    hostId: string | null;
    title: string | null;
    genre: string | null;
    templateSource: "ai" | "custom" | "seed";
    templateLength: "quick" | "classic" | "epic";
    seedText: string | null;
    templateText: string | null;
    status: string;
    responseWindowMinutes: number;
    allowAiCohost: boolean;
    vaultMode: "invite_only" | "public" | "locked";
    participants: AngryLipsParticipantResponse[];
    createdAt: string;
    updatedAt: string | null;
    turns: AngryLipsTurnResponse[];
  };
  template: {
    template: string;
    originalText: string;
    blanks: Array<{
      id: string;
      partOfSpeech: string;
      prompt: string;
    }>;
    metadata: {
      wordCount: number;
      blankCount: number;
      tagCounts: Record<string, number>;
    };
  };
}

export interface AngryLipsVaultEntryResponse {
  id: string;
  sessionId: string;
  title: string;
  storyText: string;
  visibility: "invite_only" | "public" | "locked";
  reactions: Array<{ emoji: string; count: number }>;
  createdAt: string;
  summaryText?: string | null;
  aiStoryText?: string | null;
  themePrompt?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
}

export interface AngryLipsFeedEntryResponse extends AngryLipsVaultEntryResponse {
  sessionTitle: string | null;
  genre: string | null;
  hostId: string | null;
  hostUsername: string | null;
  hostDisplayName: string | null;
}

export interface FeedActorResponse {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FeedEvent {
  id: string;
  eventType: string;
  createdAt: string;
  title: string | null;
  body: string | null;
  actor: FeedActorResponse | null;
  metadata: Record<string, unknown>;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
}

export interface StreamEvent {
  id: string;
  eventType: string;
  createdAt: string;
  payload: Record<string, unknown>;
}
