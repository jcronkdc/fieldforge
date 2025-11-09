export interface MaskMetadata {
  maskId: string;
  displayName: string;
  domains: string[];
  defaultVersion: string;
  status: "draft" | "beta" | "live" | "retired";
  tags: string[];
}

export interface MaskVersion {
  maskId: string;
  version: string;
  changelog?: string | null;
  persona: Record<string, unknown>;
  promptSchema: Record<string, unknown>;
  skillset: string[];
  llmPreset: string;
  maxContextTokens: number;
  safetyTags: string[];
}

export interface MaskSession {
  sessionId: string;
  maskId: string;
  maskVersion: string;
  blendMasks: string[];
  userId?: string | null;
  projectId?: string | null;
  context?: Record<string, unknown>;
  startedAt: string;
  endedAt?: string | null;
  endedReason?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ActivateMaskInput {
  maskId: string;
  version?: string;
  blendWith?: Array<{ maskId: string; weight?: number }>;
  userId?: string;
  projectId?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ProfessorCritiqueRecord {
  storyId?: string;
  userId?: string;
  projectId?: string;
  maskSessionId: string;
  maskId: string;
  maskVersion: string;
  mode: string;
  tone: string;
  summary?: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
  scores: Record<string, unknown>;
  metrics: Record<string, unknown>;
  customTone?: string;
}

export interface ProfessorCritiqueHistoryRow extends ProfessorCritiqueRecord {
  id: number;
  createdAt: string;
}

