import fetch from "node-fetch";

interface SimulationOptions {
  baseUrl: string;
  handlePrefix: string;
  delayMs: number;
  autoFillLast: boolean;
}

interface CreateSessionResponse {
  session: {
    id: string;
    title: string | null;
    responseWindowMinutes: number;
  } & Record<string, any>;
  template: {
    template: string;
    blanks: Array<{
      id: string;
      partOfSpeech: string;
      prompt: string;
    }>;
  };
}

interface Turn {
  id: string;
  orderIndex: number;
  partOfSpeech: string | null;
  prompt: string | null;
  placeholder: string | null;
}

interface SessionWithTurns {
  session: {
    id: string;
    title: string | null;
    responseWindowMinutes: number;
  };
  template: CreateSessionResponse["template"];
  turns: Turn[];
}

const DEFAULT_WORDS: Record<string, string[]> = {
  noun: ["hyperdrive piston", "quantum donut", "aurora cipher"],
  verb: ["teleport", "remix", "rewire"],
  adjective: ["luminous", "anarchic", "gravity-free"],
  person: ["Captain Flux", "DJ Solaris", "Professor Malachai"],
  place: ["Skyline Arcade", "Vault of Thousand Codes", "Cosmic Metro"],
  emotion: ["reckless joy", "magnetic dread", "retro-futurist awe"],
};

async function main() {
  const options = buildOptions();
  console.log(`\n[sim] Starting Angry Lips simulation at ${options.baseUrl}`);

  const createResponse = await createSession(options.baseUrl);
  const turns = createResponse.session.turns as unknown as Turn[];

  const fillerMap = new Map<string, string>();
  const sessionId = createResponse.session.id;
  const storyTitle = createResponse.session.title ?? "Simulated Session";

  console.log(`[sim] Session ${sessionId} created (${storyTitle}) with ${turns.length} turns.`);

  for (const turn of turns) {
    const part = turn.partOfSpeech ?? "noun";
    const fill = pickWord(part, turn.orderIndex);
    const handle = `${options.handlePrefix}_${turn.orderIndex + 1}`;

    console.log(
      `[sim] → Turn #${turn.orderIndex + 1} (${part}) prompt="${turn.prompt ?? ""}" fill="${fill}"`
    );

    await submitTurn(options.baseUrl, turn.id, fill, handle);
    fillerMap.set(turn.placeholder ?? turn.id, fill);

    await logEvent(options.baseUrl, turn.id, "sim_reaction", { emoji: "✨", handle });

    await sleep(options.delayMs);
  }

  if (options.autoFillLast && turns.length > 0) {
    const lastTurn = turns[turns.length - 1];
    const aiFill = pickWord(lastTurn.partOfSpeech ?? "noun", lastTurn.orderIndex + 7, "AI");
    console.log(`[sim] → Auto-filling final turn with "${aiFill}"`);
    await autoFill(options.baseUrl, lastTurn.id, aiFill, "ai-sim");
    fillerMap.set(lastTurn.placeholder ?? lastTurn.id, aiFill);
  }

  const finalStory = materializeStory(createResponse.template.template, fillerMap);
  await completeSession(options.baseUrl, sessionId, finalStory, `${storyTitle} (Sim Output)`);

  console.log("[sim] Completed session and stored story in vault.");
  console.log("[sim] Story preview:\n");
  console.log(finalStory);
}

function buildOptions(): SimulationOptions {
  const baseUrl = process.env.ANGRY_LIPS_BASE_URL ?? "http://localhost:4000";
  const handlePrefix = process.env.ANGRY_LIPS_HANDLE_PREFIX ?? "tester";
  const delayMs = Number(process.env.ANGRY_LIPS_DELAY_MS ?? "750");
  const autoFillLast = (process.env.ANGRY_LIPS_AUTOFILL ?? "true").toLowerCase() !== "false";

  return { baseUrl, handlePrefix, delayMs, autoFillLast };
}

async function createSession(baseUrl: string): Promise<CreateSessionResponse & { session: SessionWithTurns["session"] & { turns: Turn[] } }> {
  const response = await fetch(`${baseUrl}/api/angry-lips/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hostId: "sim-bot",
      title: `Sim Session ${new Date().toISOString()}`,
      genre: "heist",
      templateSource: "ai",
      templateLength: "quick",
      responseWindowMinutes: 2,
      allowAiCohost: true,
      participants: ["@botA", "@botB", "@botC"],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create session (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as CreateSessionResponse & {
    session: CreateSessionResponse["session"] & { turns: Turn[] };
  };

  return payload;
}

async function submitTurn(baseUrl: string, turnId: string, text: string, handle: string) {
  const response = await fetch(`${baseUrl}/api/angry-lips/turns/${turnId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, handle }),
  });

  if (!response.ok) {
    const output = await response.text();
    throw new Error(`Failed to submit turn ${turnId}: ${output}`);
  }
}

async function autoFill(baseUrl: string, turnId: string, text: string, handle: string) {
  const response = await fetch(`${baseUrl}/api/angry-lips/turns/${turnId}/auto-fill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, handle }),
  });

  if (!response.ok) {
    const output = await response.text();
    throw new Error(`Failed to auto-fill turn ${turnId}: ${output}`);
  }
}

async function logEvent(baseUrl: string, turnId: string, eventType: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/api/angry-lips/turns/${turnId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, payload }),
  });

  if (!response.ok) {
    const output = await response.text();
    throw new Error(`Failed to log event for ${turnId}: ${output}`);
  }
}

async function completeSession(baseUrl: string, sessionId: string, storyText: string, title: string) {
  const response = await fetch(`${baseUrl}/api/angry-lips/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storyText, title, visibility: "invite_only" }),
  });

  if (!response.ok) {
    const output = await response.text();
    throw new Error(`Failed to complete session ${sessionId}: ${output}`);
  }
}

function pickWord(partOfSpeech: string, index: number, fallbackLabel = "participant"): string {
  const pool = DEFAULT_WORDS[partOfSpeech] ?? [
    `${fallbackLabel.toLowerCase()}-${Math.abs(index % 999)}`,
  ];
  return pool[index % pool.length];
}

function materializeStory(template: string, replacements: Map<string, string>): string {
  let output = template;
  replacements.forEach((value, placeholder) => {
    const pattern = new RegExp(escapeRegex(placeholder), "g");
    output = output.replace(pattern, value);
  });
  return output;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void main().catch((error) => {
  console.error("[sim] Error", error);
  process.exitCode = 1;
});


