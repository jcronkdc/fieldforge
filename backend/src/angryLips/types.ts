export type AngryLipsSessionStatus = "draft" | "active" | "completed" | "archived";
export type AngryLipsVaultMode = "invite_only" | "public" | "locked";
export type AngryLipsTemplateSource = "ai" | "custom" | "seed";
export type AngryLipsTurnStatus = "pending" | "submitted" | "auto_filled";

export interface AngryLipsParticipant {
  id: string;
  sessionId: string;
  userId: string;
  handle: string | null;
  role: "host" | "player";
  status: "invited" | "accepted" | "declined" | "left";
  createdAt: string;
  updatedAt: string | null;
}

export interface AngryLipsSession {
  id: string;
  hostId: string | null;
  title: string | null;
  genre: string | null;
  templateSource: AngryLipsTemplateSource;
  templateLength: "quick" | "classic" | "epic";
  seedText: string | null;
  templateText: string | null;
  status: AngryLipsSessionStatus;
  responseWindowMinutes: number;
  allowAiCohost: boolean;
  vaultMode: AngryLipsVaultMode;
  participants: AngryLipsParticipant[];
  createdAt: string;
  updatedAt: string | null;
}

export interface AngryLipsTurn {
  id: string;
  sessionId: string;
  orderIndex: number;
  status: AngryLipsTurnStatus;
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
  events?: AngryLipsTurnEvent[];
}

export interface AngryLipsTurnEvent {
  id: string;
  turnId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AngryLipsVaultEntry {
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

export interface AngryLipsFeedEntry extends AngryLipsVaultEntry {
  sessionTitle: string | null;
  genre: string | null;
  hostId: string | null;
  hostUsername: string | null;
  hostDisplayName: string | null;
}

export interface AngryLipsSessionWithTurns extends AngryLipsSession {
  turns: AngryLipsTurn[];
}

export interface CreateSessionInput {
  hostId?: string;
  title?: string;
  genre?: string;
  templateSource?: AngryLipsTemplateSource;
  templateLength?: "quick" | "classic" | "epic";
  seedText?: string;
  responseWindowMinutes?: number;
  allowAiCohost?: boolean;
  vaultMode?: AngryLipsVaultMode;
  participantIds?: string[];
}

export interface TurnSubmissionInput {
  turnId: string;
  text: string;
  handle?: string;
}

export interface TurnAutoFillInput {
  turnId: string;
  text: string;
  handle?: string;
}

export interface CompleteSessionInput {
  sessionId: string;
  storyText: string;
  title?: string;
  visibility?: "invite_only" | "public" | "locked";
}

