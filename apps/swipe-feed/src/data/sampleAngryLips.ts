export interface AngryLipsTurnParticipant {
  handle: string;
  platform: "web" | "discord" | "email" | "sms";
  status: "ready" | "waiting" | "completed" | "auto";
}

export interface AngryLipsTurn {
  id: string;
  host: string;
  storyTitle: string;
  prompt: string;
  partOfSpeech: string;
  creativeNudge: string;
  expiresAt: string;
  slotIndex: number;
  totalSlots: number;
  participants: AngryLipsTurnParticipant[];
  reactions: Array<{ emoji: string; count: number }>;
}

const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60 * 1000).toISOString();

export const sampleAngryLipsTurn: AngryLipsTurn = {
  id: "turn-aurora-1",
  host: "@kyotoSignal",
  storyTitle: "Aurora Heist – Party Pack",
  prompt: "@Starlight, we need a ridiculous noun",
  partOfSpeech: "noun",
  creativeNudge: "Make it something the crew would never expect inside a vault.",
  expiresAt: minutesFromNow(3),
  slotIndex: 5,
  totalSlots: 12,
  participants: [
    { handle: "@Starlight", platform: "discord", status: "waiting" },
    { handle: "@ghostline", platform: "web", status: "completed" },
    { handle: "AI Co-host", platform: "web", status: "ready" },
  ],
  reactions: [
    { emoji: "😂", count: 14 },
    { emoji: "🤯", count: 5 },
    { emoji: "🔥", count: 8 },
  ],
};


