import { FC, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { HourglassTimer } from "../hourglass/HourglassTimer";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import {
  createAngryLipsSession,
  fetchAngryLipsSession,
  submitAngryLipsTurn,
  autoFillAngryLipsTurn,
  logAngryLipsTurnEvent,
  startAngryLipsSession,
  advanceAngryLipsTurn,
  summarizeAngryLipsSession,
  generateAngryLipsAiStory,
  publishAngryLipsSession,
} from "../../lib/angryLipsApi";
import { subscribeToAngryLipsSession } from "../../lib/realtime/ablyClient";
import type {
  AngryLipsSessionResponse,
  AngryLipsTurnEventResponse,
  AngryLipsTurnResponse,
  AngryLipsVaultEntryResponse,
} from "../../lib/types";
import type { AngryLipsParticipantResponse } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";

interface AngryLipsTurnViewProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string | null;
  onSessionUpdated?: () => void;
  onSessionClosed?: () => void;
}

interface EventLogEntry {
  id: string;
  name: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export const AngryLipsTurnView: FC<AngryLipsTurnViewProps> = ({ open, onClose, sessionId, onSessionClosed }) => {
  const PREVIEW_HOST_ID = "preview-host";
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<AngryLipsSessionResponse["session"] | null>(null);
  const [templateMetadata, setTemplateMetadata] = useState<AngryLipsSessionResponse["template"] | null>(null);
  const [activeTurn, setActiveTurn] = useState<AngryLipsTurnResponse | null>(null);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [submissionValue, setSubmissionValue] = useState("quantum donut");
  const [participants, setParticipants] = useState<AngryLipsParticipantResponse[]>([]);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [vaultEntry, setVaultEntry] = useState<AngryLipsVaultEntryResponse | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [aiStoryText, setAiStoryText] = useState<string | null>(null);
  const [themePrompt, setThemePrompt] = useState("");
  const [visibility, setVisibility] = useState<"invite_only" | "public" | "locked">("invite_only");
  const [summarizing, setSummarizing] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const orderedTurns = useMemo(() => {
    if (!sessionData) return [];
    return [...sessionData.turns].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [sessionData]);

  const currentUserId = user?.id ?? PREVIEW_HOST_ID;
  const isRealUser = Boolean(user?.id);
  const isHost = sessionData?.hostId === currentUserId;
  const hostCanStart =
    isHost &&
    sessionData?.status !== "active" &&
    participants.some((participant) => participant.status === "accepted" || participant.role === "host");
  const hostCanAdvance =
    isHost &&
    sessionData?.status === "active" &&
    Boolean(sessionData?.turns?.some((turn) => turn.dueAt) || sessionData?.turns?.some((turn) => turn.status === "pending"));
  const participantList = [...participants].sort((a, b) => {
    if (a.role === "host" && b.role !== "host") return -1;
    if (b.role === "host" && a.role !== "host") return 1;
    if (a.status === "accepted" && b.status !== "accepted") return -1;
    if (b.status === "accepted" && a.status !== "accepted") return 1;
    return a.handle?.localeCompare(b.handle ?? "") ?? 0;
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      setSessionData(null);
      setTemplateMetadata(null);
      setActiveTurn(null);
      setEventLog([]);
      setSubmissionValue("quantum donut");
      setParticipants([]);
      setSessionBusy(false);
      setVaultEntry(null);
      setSummaryText(null);
      setAiStoryText(null);
      setThemePrompt("");
      setVisibility("invite_only");
      onSessionClosed?.();
    }
  }, [open, onSessionClosed]);

  // Load or create session when opening
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadExisting = async (id: string) => {
      try {
        const result = await fetchAngryLipsSession(id);
        if (cancelled) return;
        const { session, template } = result;
        setSessionData(session);
        setTemplateMetadata(template);
        setParticipants(session.participants ?? []);
        setVisibility(session.vaultMode ?? "invite_only");
        const currentTurn =
          session.turns.find((turn) => turn.dueAt && turn.status === "pending") ??
          session.turns.find((turn) => turn.status === "pending") ??
          session.turns[session.turns.length - 1] ??
          null;
        setActiveTurn(currentTurn ?? null);
        setEventLog((prev) => [
          ...prev,
          {
            id: `session_loaded_${session.id}`,
            name: "session_loaded",
            timestamp: new Date().toISOString(),
            payload: { sessionId: session.id, status: session.status },
          },
        ]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load Angry Lips session");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const createPreview = async () => {
      try {
        const result = await createAngryLipsSession({
          hostId: isRealUser ? currentUserId : undefined,
          vaultMode: "invite_only",
        });
        if (cancelled) return;
        const { session, template } = result;
        setSessionData(session);
        setTemplateMetadata(template);
        setParticipants(session.participants ?? []);
        setVisibility(session.vaultMode ?? "invite_only");
        const pendingTurn =
          session.turns.find((turn) => turn.status === "pending" && turn.dueAt !== null) ??
          session.turns.find((turn) => turn.status === "pending") ??
          session.turns[0] ??
          null;
        setActiveTurn(pendingTurn ?? null);
        setEventLog([
          {
            id: `session_created_${session.id}`,
            name: "session_created",
            timestamp: new Date().toISOString(),
            payload: {
              sessionId: session.id,
              blankCount: template.blanks.length,
            },
          },
        ]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to create Angry Lips session");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (sessionId) {
      loadExisting(sessionId);
    } else {
      createPreview();
    }

    return () => {
      cancelled = true;
    };
  }, [open, sessionId, isRealUser, currentUserId]);

  // Subscribe to realtime events for the current session
  useEffect(() => {
    if (!open || !sessionData) return;

    let unsubscribe: (() => Promise<void>) | undefined;
    let cancelled = false;

    subscribeToAngryLipsSession(sessionData.id, ({ name, data }) => {
      if (cancelled) return;
      setEventLog((prev) => [
        ...prev,
        {
          id: `${name}_${Date.now()}`,
          name,
          timestamp: new Date().toISOString(),
          payload: data,
        },
      ]);

      const payload = (data ?? {}) as Record<string, unknown>;

      if (name === "participant_status") {
        const participantId = typeof payload.participantId === "string" ? payload.participantId : null;
        const rawStatus = typeof payload.status === "string" ? payload.status : undefined;
        const allowedStatuses = new Set(["accepted", "declined", "invited", "left"]);
        const status = rawStatus && allowedStatuses.has(rawStatus)
          ? (rawStatus as AngryLipsParticipantResponse["status"])
          : undefined;
        const handle = typeof payload.handle === "string" ? payload.handle : undefined;
        if (!participantId) {
          return;
        }
        setParticipants((prev) => {
          const existing = prev.find((participant) => participant.userId === participantId);
          if (!existing) {
            return [
              ...prev,
              {
                id: `${participantId}-${Date.now()}`,
                sessionId: sessionData?.id ?? "preview",
                userId: participantId,
                status: status ?? "accepted",
                role: "player",
                handle: handle ?? null,
                joinedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: null,
              },
            ];
          }
          return prev.map((participant) =>
            participant.userId === participantId
              ? {
                  ...participant,
                  status: status ?? participant.status,
                  handle: handle ?? participant.handle ?? null,
                  updatedAt: new Date().toISOString(),
                }
              : participant
          );
        });
      }

      if (name === "session_started") {
        let firstTurnRef: AngryLipsTurnResponse | null = null;
        setSessionData((prev) => {
          if (!prev) return prev;
          const updatedTurns = prev.turns.map((turn) => {
            const dueAt = typeof payload.dueAt === "string" ? payload.dueAt : turn.dueAt;
            const expiresAt = typeof payload.expiresAt === "string" ? payload.expiresAt : turn.expiresAt;
            if (turn.id === payload.firstTurnId) {
              const updatedTurn = {
                ...turn,
                dueAt,
                expiresAt,
              };
              firstTurnRef = updatedTurn;
              return updatedTurn;
            }
            return turn;
          });
          return {
            ...prev,
            status: "active",
            turns: updatedTurns,
          };
        });
        if (Array.isArray(payload.participantOrder)) {
          const order = payload.participantOrder as Array<{ userId?: string; handle?: string }>;
          setParticipants((prev) =>
            prev.map((participant) => {
              const updated = order.find((entry) => entry.userId === participant.userId);
              return updated && typeof updated.handle === "string"
                ? { ...participant, handle: updated.handle }
                : participant;
            })
          );
        }
        if (firstTurnRef) {
          setActiveTurn(firstTurnRef);
        }
      }

      if (name === "session_completed") {
        setSessionData((prev) => (prev ? { ...prev, status: "completed" } : prev));
      }

      if (name === "turn_advanced" && typeof payload.turnId === "string") {
        const dueAt = typeof payload.dueAt === "string" ? payload.dueAt : null;
        const expiresAt = typeof payload.expiresAt === "string" ? payload.expiresAt : null;
        let nextTurnRef: AngryLipsTurnResponse | null = null;
        setSessionData((prev) => {
          if (!prev) return prev;
          const updatedTurns = prev.turns.map((turn) => {
            if (turn.id === payload.turnId) {
              const updatedTurn = {
                ...turn,
                dueAt,
                expiresAt,
              };
              nextTurnRef = updatedTurn;
              return updatedTurn;
            }
            if (turn.dueAt && turn.id !== payload.turnId) {
              return { ...turn, dueAt: null, expiresAt: null };
            }
            return turn;
          });
          return { ...prev, turns: updatedTurns };
        });
        if (nextTurnRef) {
          setActiveTurn(nextTurnRef);
        }
        return;
      }

      if (typeof payload.turnId === "string" && sessionData) {
        setSessionData((prev) => {
          if (!prev) return prev;
          const updatedTurns = prev.turns.map((turn) => {
            if (turn.id !== payload.turnId) return turn;
            return {
              ...turn,
              status: name === "auto_filled" ? "auto_filled" : name === "submitted" ? "submitted" : turn.status,
              submissionHandle:
                typeof payload.handle === "string" ? payload.handle : turn.submissionHandle,
              submittedAt: name === "submitted" ? new Date().toISOString() : turn.submittedAt,
              autoFillText:
                typeof payload.autoFillText === "string" ? payload.autoFillText : turn.autoFillText,
            };
          });
          return { ...prev, turns: updatedTurns };
        });

        if (activeTurn && payload.turnId === activeTurn.id) {
          setActiveTurn((prev) =>
            prev
              ? {
                  ...prev,
                  status: name === "auto_filled" ? "auto_filled" : name === "submitted" ? "submitted" : prev.status,
                  submissionHandle:
                    typeof payload.handle === "string" ? payload.handle : prev.submissionHandle,
                  autoFillText:
                    typeof payload.autoFillText === "string" ? payload.autoFillText : prev.autoFillText,
                }
              : prev
          );
        }
      }
    })
      .then((fn) => {
        unsubscribe = fn;
      })
      .catch((err) => {
        console.warn("[ably] subscribe failed", err);
      });

    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe().catch(() => {
          /* ignore */
        });
      }
    };
  }, [open, sessionData, activeTurn?.id]);

  useEffect(() => {
    if (sessionData?.vaultMode) {
      setVisibility(sessionData.vaultMode);
    }
  }, [sessionData?.vaultMode]);

  useEffect(() => {
    if (!vaultEntry) {
      return;
    }
    setSummaryText(vaultEntry.summaryText ?? null);
    setAiStoryText(vaultEntry.aiStoryText ?? null);
    if (vaultEntry.visibility) {
      setVisibility(vaultEntry.visibility);
    }
    if (vaultEntry.themePrompt) {
      setThemePrompt(vaultEntry.themePrompt);
    }
  }, [vaultEntry]);

  const handleSubmit = async () => {
    if (!activeTurn || !submissionValue.trim()) return;
    try {
      const response = await submitAngryLipsTurn(activeTurn.id, submissionValue.trim(), "@previewUser");
      const updatedTurn = response.turn;
      setActiveTurn(updatedTurn);
      setSessionData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          turns: prev.turns.map((turn) => (turn.id === updatedTurn.id ? updatedTurn : turn)),
        };
      });
      setSubmissionValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit turn");
    }
  };

  const handleAutoFill = async () => {
    if (!activeTurn) return;
    try {
      const response = await autoFillAngryLipsTurn(activeTurn.id, "AI filled this blank with a cosmic seltzer.", "ai");
      const updatedTurn = response.turn;
      setActiveTurn(updatedTurn);
      setSessionData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          turns: prev.turns.map((turn) => (turn.id === updatedTurn.id ? updatedTurn : turn)),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to auto-fill turn");
    }
  };

  const handleStartSession = async () => {
    if (!sessionData) return;
    setSessionBusy(true);
    try {
      const response = await startAngryLipsSession(sessionData.id, currentUserId);
      setSessionData(response.session);
      setParticipants(response.session.participants ?? []);
      const current =
        response.session.turns.find((turn) => turn.dueAt) ??
        response.session.turns.find((turn) => turn.status === "pending") ??
        null;
      if (current) {
        setActiveTurn(current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setSessionBusy(false);
    }
  };

  const handleAdvanceTurn = async () => {
    if (!sessionData) return;
    setSessionBusy(true);
    try {
      const response = await advanceAngryLipsTurn(sessionData.id, currentUserId);
      setSessionData(response.session);
      setParticipants(response.session.participants ?? []);
      const current = response.session.turns.find((turn) => turn.dueAt) ?? null;
      if (current) {
        setActiveTurn(current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to advance turn");
    } finally {
      setSessionBusy(false);
    }
  };

  const handleLogReaction = async (emoji: string) => {
    if (!activeTurn) return;
    try {
      await logAngryLipsTurnEvent(activeTurn.id, "reaction", { emoji });
    } catch (err) {
      console.warn("Failed to log reaction", err);
    }
  };

  const handleSummarize = async () => {
    if (!sessionData) return;
    setSummarizing(true);
    setError(null);
    try {
      const response = await summarizeAngryLipsSession(sessionData.id, currentUserId, themePrompt);
      setVaultEntry(response.entry);
      setSummaryText(response.summary ?? response.entry.summaryText ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize session");
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!sessionData || !isHost) return;
    setGeneratingStory(true);
    setError(null);
    try {
      const response = await generateAngryLipsAiStory(sessionData.id, currentUserId, themePrompt);
      setVaultEntry(response.entry);
      setAiStoryText(response.story ?? response.entry.aiStoryText ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI story");
    } finally {
      setGeneratingStory(false);
    }
  };

  const handlePublish = async () => {
    if (!sessionData || !isHost) return;
    setPublishing(true);
    setError(null);
    try {
      const response = await publishAngryLipsSession(sessionData.id, currentUserId, visibility);
      setVaultEntry(response.entry);
      setVisibility(response.entry.visibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    } finally {
      setPublishing(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-slate-300">Spinning up a fresh Angry Lips session…</div>;
    }

    if (error) {
      return (
        <div className="p-8 text-center text-rose-300">
          <p className="font-semibold">Something caught fire.</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      );
    }

    if (!sessionData || !activeTurn) {
      return <div className="p-8 text-center text-slate-400">Preparing template and blanks…</div>;
    }

    return (
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-aurora/40 bg-white/5 p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-white">{activeTurn.prompt ?? "We need a wild word"}</h3>
            {activeTurn.creativeNudge ? (
              <p className="mt-2 text-sm text-slate-200">{activeTurn.creativeNudge}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-300">
              {activeTurn.partOfSpeech ? (
                <Pill variant="aurora" className="normal-case text-sm text-aurora">
                  {activeTurn.partOfSpeech}
                </Pill>
              ) : null}
              <span>Session {sessionData.id.slice(0, 8)} · Turn {activeTurn.orderIndex + 1}</span>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Your word
                <input
                  type="text"
                  value={submissionValue}
                  onChange={(event) => setSubmissionValue(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-aurora"
                  placeholder="e.g. glitterbomb"
                />
              </label>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="uppercase tracking-wide">Quick suggestions</span>
                {suggestions.map((word) => (
                  <button
                    key={word}
                    type="button"
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-aurora hover:text-white"
                    onClick={() => setSubmissionValue(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="primary" className="justify-center" onClick={handleSubmit}>
                  Submit word
                </Button>
                <Button type="button" variant="secondary" className="justify-center" onClick={handleAutoFill}>
                  Trigger AI fill
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-black/40 p-5 text-sm text-slate-300">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Turn statuses</h4>
            <div className="mt-3 space-y-2">
              {orderedTurns.map((turn) => (
                <div
                  key={turn.id}
                  className={clsx(
                    "flex items-center justify-between rounded-2xl border px-3 py-2",
                    turn.id === activeTurn.id
                      ? "border-aurora/40 bg-aurora/5 text-aurora"
                      : turn.status === "auto_filled"
                      ? "border-fuchsia-500/40 bg-fuchsia-900/10 text-fuchsia-200"
                      : turn.status === "submitted"
                      ? "border-slate-800 bg-white/5 text-slate-200"
                      : "border-slate-800 bg-white/5 text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Turn {turn.orderIndex + 1}</span>
                    {turn.partOfSpeech ? (
                      <Pill variant="subtle" className="normal-case text-[0.6rem]">
                        {turn.partOfSpeech}
                      </Pill>
                    ) : null}
                    {turn.assignedHandle ? (
                      <span className="text-xs text-slate-400">→ {turn.assignedHandle}</span>
                    ) : null}
                  </div>
                  <span className="text-xs uppercase tracking-wide">{turn.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-black/40 p-5 text-sm text-slate-300">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Live reactions</h4>
            <div className="mt-3 flex flex-wrap gap-3">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-black/30 px-3 py-1 text-sm text-slate-200 hover:border-aurora hover:text-white"
                  onClick={() => handleLogReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-black/40 p-5 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Participants</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {participantList.map((participant) => (
                <li key={participant.id} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-black/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {participant.handle ?? (participant.userId ? `@${participant.userId.slice(0, 6)}` : "Pending handle")}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">{participant.status}</span>
                  </div>
                  {participant.role === "host" ? <Pill variant="aurora">Host</Pill> : null}
                </li>
              ))}
              {participantList.length === 0 ? <li className="text-xs text-slate-500">No participants yet</li> : null}
            </ul>
            {isHost ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleStartSession}
                  disabled={sessionBusy || !hostCanStart}
                >
                  {sessionBusy ? "Working…" : sessionData?.status === "active" ? "Session active" : "Start session"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAdvanceTurn}
                  disabled={sessionBusy || !hostCanAdvance}
                >
                  {sessionBusy ? "Working…" : "Advance turn"}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Theme & AI Tools</h4>
            <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Theme prompt
              <textarea
                value={themePrompt}
                onChange={(event) => setThemePrompt(event.target.value)}
                rows={3}
                placeholder="e.g. recap the heist like a noir radio drama"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleSummarize}
                disabled={summarizing || !sessionData}
              >
                {summarizing ? "Summarizing…" : "Summarize theme"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleGenerateStory}
                disabled={generatingStory || !sessionData || !isHost}
              >
                {generatingStory ? "Writing…" : "AI rewrite"}
              </Button>
            </div>
            {summaryText ? (
              <div className="mt-3 rounded-xl border border-aurora/30 bg-aurora/5 p-3 text-xs leading-relaxed text-slate-200">
                <div className="text-[11px] uppercase tracking-wide text-aurora-200">AI Summary</div>
                <p className="mt-1 text-slate-100">{summaryText}</p>
              </div>
            ) : null}
            {aiStoryText ? (
              <div className="mt-3 rounded-xl border border-slate-800 bg-black/40 p-3 text-xs leading-relaxed text-slate-200">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">AI Rewrite</div>
                <p className="mt-1 whitespace-pre-line text-slate-200">{aiStoryText}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Visibility & Publishing</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={visibility === "invite_only" ? "primary" : "secondary"}
                onClick={() => setVisibility("invite_only")}
              >
                Private room
              </Button>
              <Button
                type="button"
                size="sm"
                variant={visibility === "public" ? "primary" : "secondary"}
                onClick={() => setVisibility("public")}
              >
                Publishable
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {visibility === "public"
                ? "Once published, this session appears in the public Angry Lips feed."
                : "Keep this session invite-only until you decide to publish."}
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={handlePublish}
              disabled={!isHost || publishing}
            >
              {publishing ? "Updating…" : visibility === "public" ? "Publish to feed" : "Save visibility"}
            </Button>
            {vaultEntry?.publishedAt ? (
              <p className="mt-2 text-[11px] uppercase tracking-wide text-aurora-200">
                Published {new Date(vaultEntry.publishedAt).toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-aurora/30 bg-white/5 p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Session</h4>
            <p className="mt-2 text-sm text-slate-200">{sessionData.title ?? "Untitled session"}</p>
            <p className="text-xs text-slate-400">
              Template: {sessionData.templateSource} · Length: {sessionData.templateLength}
            </p>
            {sessionData.seedText ? (
              <details className="mt-3 text-xs text-slate-400">
                <summary className="cursor-pointer text-slate-300">Seed text</summary>
                <p className="mt-2 whitespace-pre-line bg-black/30 p-2 text-slate-400">{sessionData.seedText}</p>
              </details>
            ) : null}
          </div>

          {templateMetadata ? (
            <div className="rounded-2xl border border-slate-800 bg-white/5 p-4 text-xs text-slate-300">
              <h4 className="text-xs uppercase tracking-wide text-slate-500">Template preview</h4>
              <p className="mt-2 whitespace-pre-wrap text-slate-200">{templateMetadata.template}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-800 bg-white/5 p-4 text-xs text-slate-300">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">Event log</h4>
            <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
              {eventLog.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-800 bg-black/30 p-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
                    <span>{event.name}</span>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-300">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))}
              {eventLog.length === 0 ? <p className="text-[11px] text-slate-500">No events yet</p> : null}
            </div>
          </div>
        </aside>
      </section>
    );
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <article className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-aurora/40 bg-[#040a16]/90 p-8 text-white shadow-2xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Angry Lips Turn</p>
            <h2 className="text-2xl font-semibold text-white">
              {sessionData?.title ?? "Aurora Heist – Party Pack"}
            </h2>
            <p className="text-sm text-slate-300">
              {sessionData?.id ? `Session ${sessionData.id.slice(0, 8)}` : "Generating session"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {sessionData?.status === "active" && activeTurn?.expiresAt ? (
              <HourglassTimer size="sm" expiresAt={activeTurn.expiresAt} label="Time remaining" />
            ) : (
              <div className="rounded-full border border-slate-800/60 bg-black/40 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
                Waiting to start
              </div>
            )}
            <Button type="button" variant="ghost" iconOnly onClick={onClose} aria-label="Close preview">
              ✕
            </Button>
          </div>
        </header>

        {renderContent()}
      </article>
    </div>
  );
};

const suggestions = ["glitterbomb", "space llama", "quantum donut"];
const reactionEmojis = ["😂", "🤯", "🔥", "👏", "💫"];


