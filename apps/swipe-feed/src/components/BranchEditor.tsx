import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import type { StoryHighlight } from "../data/sampleStories";
import type { RemixMode } from "./RemixModal";
import {
  requestProfessorCritique,
  fetchProfessorCritiqueHistory,
  type ProfessorCritique,
  type ProfessorMode,
  type ProfessorCritiqueHistoryItem,
} from "../lib/professor";
import { track } from "../lib/analytics";
import { Button } from "./ui/Button";
import { Slider } from "./ui/Slider";
import { Pill } from "./ui/Pill";
import { HourglassTimer } from "./hourglass/HourglassTimer";

interface CritiqueHistoryEntry {
  mode: ProfessorMode;
  customTone?: string;
  createdAt: string;
  critique: ProfessorCritique;
  source: "session" | "persisted";
}

export interface BranchDraft {
  title: string;
  content: string;
  tags: string[];
  isCanon: boolean;
  collabEnabled: boolean;
  invites: string[];
  responseWindowMinutes: number | null;
}

const responseWindowPresets = [5, 15, 30, 60, 120, 240, 1440] as const;

interface BranchEditorProps {
  open: boolean;
  story: StoryHighlight;
  mode: RemixMode;
  onClose: () => void;
  onSave: (draft: BranchDraft) => void;
}

export const BranchEditor: FC<BranchEditorProps> = ({ open, story, mode, onClose, onSave }) => {
  const [title, setTitle] = useState(`Remix: ${story.title}`);
  const [content, setContent] = useState(getSeedContent(mode, story));
  const [tagsText, setTagsText] = useState(story.tags.join(", "));
  const [isCanon, setIsCanon] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(mode === "assist");
  const [collabEnabled, setCollabEnabled] = useState(false);
  const [invitesText, setInvitesText] = useState("");
  const [responseWindowMinutes, setResponseWindowMinutes] = useState<(typeof responseWindowPresets)[number]>(30);
  const [critiqueMode, setCritiqueMode] = useState<ProfessorMode>("serious");
  const [customTone, setCustomTone] = useState("");
  const [critique, setCritique] = useState<ProfessorCritique | null>(null);
  const [critiqueStatus, setCritiqueStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [critiqueError, setCritiqueError] = useState<string | null>(null);
  const [critiqueHistory, setCritiqueHistory] = useState<CritiqueHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const historyKey = useMemo(() => `professorCritiques:${story.id}`, [story.id]);
  const responseWindowIndex = useMemo(() => {
    const index = responseWindowPresets.indexOf(responseWindowMinutes);
    return index >= 0 ? index : 0;
  }, [responseWindowMinutes]);

  const responseWindowMarks = useMemo(
    () =>
      responseWindowPresets.map((minutes, index) => ({
        value: index,
        label: formatResponseWindow(minutes),
      })),
    []
  );

  useEffect(() => {
    if (open) {
      setTitle(`Remix: ${story.title}`);
      const seed = getSeedContent(mode, story);
      setContent(seed);
      setTagsText(story.tags.join(", "));
      setIsCanon(false);
      setShowSuggestion(mode === "assist" && seed.length > 0);
      setCollabEnabled(false);
      setInvitesText("");
      setResponseWindowMinutes(30);
      setCritiqueMode("serious");
      setCustomTone("");
      setCritique(null);
      setCritiqueStatus("idle");
      setCritiqueError(null);
      const stored = sessionStorage.getItem(historyKey);
      if (stored) {
        try {
          const parsed: CritiqueHistoryEntry[] = JSON.parse(stored).map((entry: any) => ({
            mode: entry.mode,
            customTone: entry.customTone,
            createdAt: entry.createdAt ?? entry.timestamp ?? new Date().toISOString(),
            critique: entry.critique,
            source: "session",
          }));
          setCritiqueHistory(parsed);
          if (parsed.length > 0) {
            setCritique(parsed[0].critique);
            setCritiqueMode(parsed[0].mode);
            setCustomTone(parsed[0].customTone ?? "");
            setCritiqueStatus("success");
          }
        } catch (error) {
          console.warn("Failed to parse critique history", error);
          setCritiqueHistory([]);
        }
      } else {
        setCritiqueHistory([]);
      }
    }
  }, [open, story, mode, historyKey]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadPersistedHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const remote = await fetchProfessorCritiqueHistory({ storyId: story.id, limit: 10 });
        if (cancelled || remote.length === 0) {
          setHistoryLoading(false);
          return;
        }
        const entries: CritiqueHistoryEntry[] = remote.map((item: ProfessorCritiqueHistoryItem) => ({
          mode: item.mode,
          customTone: item.customTone,
          createdAt: item.createdAt,
          critique: item.critique,
          source: "persisted",
        }));

        setCritiqueHistory((prev) => mergeHistory(prev, entries, historyKey));
      } catch (error) {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : "Unable to load critique history.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadPersistedHistory();

    return () => {
      cancelled = true;
    };
  }, [open, story.id, historyKey]);

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/);
    return content.trim().length === 0 ? 0 : words.length;
  }, [content]);

  const responseIndex = useMemo(() => {
    const index = responseWindowPresets.indexOf(responseWindowMinutes);
    return index === -1 ? 0 : index;
  }, [responseWindowMinutes]);

  const responseMarks = useMemo(
    () =>
      responseWindowPresets.map((minutes, index) => ({
        value: index,
        label: formatResponseWindow(minutes),
      })),
    []
  );

  if (!open) return null;

  const saveDraft = () => {
    const invites = invitesText
      .split(",")
      .map((invite) => invite.trim())
      .filter(Boolean);

    onSave({
      title: title.trim() || `Remix of ${story.title}`,
      content,
      tags: tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isCanon,
      collabEnabled,
      invites,
      responseWindowMinutes: collabEnabled ? responseWindowMinutes : null,
    });
  };

  const fetchCritique = async (modeOverride?: ProfessorMode, customToneOverride?: string) => {
    if (!content.trim()) {
      setCritiqueError("Add some content before requesting feedback.");
      setCritiqueStatus("error");
      return;
    }

    const selectedMode = modeOverride ?? critiqueMode;
    const nextCustomTone = selectedMode === "custom" ? customToneOverride ?? customTone : undefined;
    setCritiqueStatus("loading");
    setCritiqueError(null);
    track("professor_critique_requested", {
      story_id: story.id,
      mode: selectedMode,
    });

    try {
      const result = await requestProfessorCritique({
        content,
        mode: selectedMode,
        objectType: "story",
        customTone: nextCustomTone,
        storyId: story.id,
      });
      setCritique(result);
      setCritiqueStatus("success");
      const entry: CritiqueHistoryEntry = {
        mode: selectedMode,
        customTone: nextCustomTone,
        createdAt: new Date().toISOString(),
        critique: result,
        source: "session",
      };
      setCritiqueHistory((prev) => mergeHistory(prev, [entry], historyKey));
      track("professor_critique_received", {
        story_id: story.id,
        mode: selectedMode,
        tone: result.tone,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch critique.";
      setCritiqueStatus("error");
      setCritiqueError(message);
      track("professor_critique_failed", {
        story_id: story.id,
        mode: selectedMode,
        error: message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[1fr_420px] bg-black/80 backdrop-blur">
      <div className="flex flex-col gap-6 overflow-y-auto bg-[#050a16] p-8 text-white">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Remixing</p>
          <h2 className="text-2xl font-semibold">{story.title}</h2>
          <p className="text-sm text-slate-300">
            Mode selected: <strong className="text-aurora">{labelForMode(mode)}</strong> — craft your
            new branch and save when you’re ready. Word count updates live.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Branch title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-slate-700 bg-white/5 px-3 py-2 text-base text-white outline-none focus:border-aurora"
              placeholder="New branch title"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Story continuation
            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setShowSuggestion(false);
              }}
              rows={12}
              className="rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-base leading-relaxed text-slate-100 outline-none focus:border-aurora"
            />
          </label>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCanon}
              onChange={(event) => setIsCanon(event.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-white/5 text-aurora focus:ring-aurora"
            />
            Mark as canon-worthy
          </label>
          <Pill variant="subtle" className="text-[0.65rem] uppercase tracking-wide">
            {wordCount} words
          </Pill>
        </div>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Tags (comma-separated)
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              className="rounded-lg border border-slate-700 bg-white/5 px-3 py-2 text-base text-white outline-none focus:border-aurora"
              placeholder="e.g. neon, heist, glitch"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" onClick={saveDraft}>
            Save draft
          </Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          {mode === "assist" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setContent((prev) => `${prev}\n\n${generateAssistHint(story)}`);
                setShowSuggestion(false);
              }}
            >
              Add AI hint
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-white/5 p-5 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Pass the pen</h4>
              <p className="mt-1 text-xs text-slate-300">
                Invite collaborators to continue this branch in a private session.
              </p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={collabEnabled}
                onChange={(event) => setCollabEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-white/5 text-aurora focus:ring-aurora"
              />
              <span className="text-xs uppercase tracking-wide text-slate-400">Enable</span>
            </label>
          </div>
          {collabEnabled ? (
            <>
              <label className="flex flex-col gap-1 text-xs text-slate-300">
                Invite handles or emails (comma-separated)
                <input
                  value={invitesText}
                  onChange={(event) => setInvitesText(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-aurora"
                  placeholder="e.g. @storysmith, writer@example.com"
                />
              </label>
              <p className="text-xs text-slate-400">
                Invitees receive synchronized prompts across MythaTron, Discord, email, X, Instagram,
                and Messenger. Only your chosen collaborators can see this branch.
              </p>
              <div className="flex flex-col gap-3 rounded-xl border border-fuchsia-700/40 bg-fuchsia-900/10 p-4">
                <div className="flex items-center gap-4">
                  <HourglassTimer
                    size="lg"
                    expiresAt={Date.now() + (responseWindowMinutes || 1) * 60 * 1000}
                    label="Response window"
                    cta="Everyone sees this timer"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Response window</p>
                    <p className="text-xs text-slate-200">
                      {formatResponseWindow(responseWindowMinutes)} before the AI finishes the blank so
                      the story never stalls.
                    </p>
                    <Pill variant="aurora" className="text-[0.65rem] uppercase tracking-wide">
                      {formatResponseWindow(responseWindowMinutes)} cap
                    </Pill>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs text-slate-300">
                  <span className="uppercase tracking-wide text-slate-500">Set the timer</span>
                  <Slider
                    value={responseWindowIndex}
                    min={0}
                    max={responseWindowPresets.length - 1}
                    step={1}
                    marks={responseWindowMarks}
                    onChange={(index) => {
                      const preset = responseWindowPresets[index] ?? responseWindowPresets[0];
                      setResponseWindowMinutes(preset);
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Virtual hourglasses spill in real time across every platform. If someone misses their turn,
                  we log it and the AI keeps momentum—with attribution that the section was auto-completed.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <aside className="hidden h-full flex-col gap-4 border-l border-slate-900 bg-[#080f21] p-6 text-sm text-slate-300 lg:flex">
        <h3 className="text-xs uppercase tracking-wide text-slate-500">Context</h3>
        <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white">Previously on {story.world}</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{story.snippet}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white">Mode tips</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{tipsForMode(mode)}</p>
        </div>

        {showSuggestion ? (
          <div className="rounded-2xl border border-aurora/60 bg-aurora/5 p-4 text-xs text-aurora">
            Draft seeded from sample AI suggestion. Tweak as needed!
          </div>
        ) : null}

        <div className="rounded-2xl border border-aurora/30 bg-white/5 p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">Professor critique</h4>
            <span className="rounded-full border border-aurora/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-aurora">
              {critique?.tone ?? "Select tone"}
            </span>
          </div>

          <label className="mt-3 flex flex-col gap-1 text-[11px] uppercase tracking-wide text-slate-400">
            Tone mode
            <select
              value={critiqueMode}
              onChange={(event) => setCritiqueMode(event.target.value as ProfessorMode)}
              className="rounded-lg border border-aurora/30 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-aurora"
            >
              <option value="serious">Serious — academic</option>
              <option value="funny">Funny — comedic</option>
              <option value="insult">Insult — hypercritical</option>
              <option value="heckler">Heckler — heckling</option>
              <option value="chaos">Chaos — blended</option>
              <option value="custom">Custom tone</option>
            </select>
          </label>

          {critiqueMode === "custom" ? (
            <label className="mt-2 flex flex-col gap-1 text-[11px] uppercase tracking-wide text-slate-400">
              Custom tone keywords
              <input
                value={customTone}
                onChange={(event) => setCustomTone(event.target.value)}
                className="rounded-lg border border-aurora/30 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-aurora"
                placeholder="e.g. noir detective, jubilant"
              />
            </label>
          ) : null}

          <Button
            type="button"
            variant="primary"
            className="mt-3 w-full justify-center"
            onClick={() => fetchCritique()}
            disabled={critiqueStatus === "loading"}
          >
            {critiqueStatus === "loading" ? "Requesting..." : "Get Professor critique"}
          </Button>

          {critiqueHistory.length > 0 ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                <span>Recent critiques</span>
                <span className="text-slate-500">
                  {historyLoading ? "Loading..." : `Last: ${formatTimeAgo(critiqueHistory[0].createdAt)}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {critiqueHistory.map((entry) => (
                  <Button
                    key={`${entry.mode}-${entry.createdAt}-${entry.source}`}
                    type="button"
                    size="sm"
                    onClick={() => {
                      setCritique(entry.critique);
                      setCritiqueMode(entry.mode);
                      setCustomTone(entry.customTone ?? "");
                      setCritiqueStatus("success");
                      track("professor_critique_viewed_cached", {
                        story_id: story.id,
                        mode: entry.mode,
                        source: entry.source,
                      });
                    }}
                  >
                    {labelForHistory(entry)}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="pl-0 text-[11px] text-aurora underline hover:text-white"
                onClick={() => {
                  const latest = critiqueHistory[0];
                  if (!latest) return;
                  setCritiqueMode(latest.mode);
                  setCustomTone(latest.customTone ?? "");
                  fetchCritique(latest.mode, latest.customTone ?? "");
                }}
              >
                Re-run last critique
              </Button>
            </div>
          ) : null}

          {critiqueStatus === "error" && critiqueError ? (
            <p className="mt-2 text-[11px] text-rose-300">{critiqueError}</p>
          ) : null}

          {critique ? (
            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-200">{critique.summary}</p>

              <CritiqueList title="Strengths" items={dedupe(critique.strengths)} variant="strength" />
              <CritiqueList title="Risks" items={dedupe(critique.risks)} variant="risk" />
              <CritiqueList title="Suggestions" items={dedupe(critique.suggestions)} variant="suggestion" />

              <div className="rounded-xl border border-aurora/30 bg-white/5 p-3">
                <h5 className="text-[11px] uppercase tracking-wide text-aurora">Scores</h5>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(critique.scores).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-aurora/20 bg-white/5 px-2 py-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{key}</p>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

function formatResponseWindow(minutes: number | null): string {
  if (!minutes) return "Instant";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    if (hours % 24 === 0) {
      const days = hours / 24;
      return `${days} day${days === 1 ? "" : "s"}`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const hours = minutes / 60;
  return `${hours.toFixed(1)} hours`;
}

function getSeedContent(mode: RemixMode, story: StoryHighlight): string {
  switch (mode) {
    case "assist":
      return `The air around ${story.title} shimmers as a whispered clue materializes...`;
    case "branch":
      return `Branch point: describe the moment everything diverges for ${story.world}.`;
    case "blank":
    default:
      return "";
  }
}

function labelForMode(mode: RemixMode): string {
  switch (mode) {
    case "assist":
      return "Co-author Assist";
    case "branch":
      return "Branch the Timeline";
    case "blank":
    default:
      return "From Scratch";
  }
}

function tipsForMode(mode: RemixMode): string {
  switch (mode) {
    case "assist":
      return "Lean on AI hints for pacing and surprise while keeping the voice uniquely yours.";
    case "branch":
      return "Focus on the decision point—why this fork matters and how it impacts canon.";
    case "blank":
    default:
      return "Feel free to reinvent characters or settings. Anything goes in a fresh branch.";
  }
}

function generateAssistHint(story: StoryHighlight): string {
  return `AI hint: a side character reveals a secret that flips ${story.world}'s power dynamic.`;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

const CritiqueList: FC<{ title: string; items: string[]; variant: "strength" | "risk" | "suggestion" }> = ({
  title,
  items,
  variant,
}) => {
  if (!items.length) return null;

  const toneClass =
    variant === "strength"
      ? "text-emerald-300"
      : variant === "risk"
      ? "text-rose-300"
      : "text-sky-300";

  return (
    <div className="rounded-xl border border-slate-700 bg-white/5 p-3">
      <h5 className={`text-[11px] uppercase tracking-wide ${toneClass}`}>{title}</h5>
      <ul className="mt-2 space-y-2 text-slate-200">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

function isSameHistoryEntry(a: CritiqueHistoryEntry, b: CritiqueHistoryEntry) {
  return a.mode === b.mode && (a.customTone ?? "") === (b.customTone ?? "");
}

function labelForHistory(entry: CritiqueHistoryEntry) {
  const base = entry.mode === "custom" && entry.customTone ? `Custom · ${entry.customTone}` : capitalize(entry.mode);
  const sourceLabel = entry.source === "persisted" ? "cloud" : "local";
  return `${base} · ${formatTimeAgo(entry.createdAt)} · ${sourceLabel}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTimeAgo(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mergeHistory(
  prev: CritiqueHistoryEntry[],
  incoming: CritiqueHistoryEntry[],
  historyKey: string
): CritiqueHistoryEntry[] {
  const combined = [...incoming, ...prev].reduce<CritiqueHistoryEntry[]>((result, entry) => {
    if (result.some((existing) => isSameHistoryEntry(existing, entry) && existing.source === entry.source)) {
      return result;
    }
    result.push(entry);
    return result;
  }, []);

  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sessionOnly = combined.filter((item) => item.source === "session");
  sessionStorage.setItem(
    historyKey,
    JSON.stringify(
      sessionOnly.map(({ source, ...rest }) => ({
        ...rest,
      }))
    )
  );

  return combined.slice(0, 10);
}


