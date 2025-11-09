import { useMemo } from "react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import type { StreamEvent } from "../../lib/types";

interface MythaStreamProps {
  events: StreamEvent[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onBack: () => void;
  onOpenFeed: () => void;
  onOpenSession: (sessionId: string) => void;
}

export function MythaStream({
  events,
  loading,
  error,
  hasMore,
  onRefresh,
  onLoadMore,
  onBack,
  onOpenFeed,
  onOpenSession,
}: MythaStreamProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b19] via-[#07132a] to-[#020611] text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-[#050b19]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">MythaStream</p>
            <h1 className="text-2xl font-semibold text-white">Live creative pulse</h1>
            <p className="text-sm text-slate-400">See Angry Lips publishes, story beats, and BookWorm signals in real time.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={onBack}>
                Prologue
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onOpenFeed}>
                Swipe feed
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-6">
        {error ? (
          <div className="rounded-3xl border border-rose-500/50 bg-rose-900/30 p-4 text-sm text-rose-100">
            <p className="font-semibold">Something caught fire.</p>
            <p className="mt-1 text-rose-200/80">{error.message}</p>
          </div>
        ) : null}

        {events.length === 0 && !loading ? (
          <div className="rounded-3xl border border-slate-800/60 bg-black/40 p-6 text-center text-sm text-slate-300">
            <p>No stream activity yet. Publish an Angry Lips session or share a new branch to get things rolling.</p>
          </div>
        ) : null}

        {events.map((event) => (
          <StreamCard key={event.id} event={event} onOpenSession={onOpenSession} />
        ))}

        <div className="flex items-center justify-center py-6">
          {hasMore ? (
            <Button type="button" variant="secondary" onClick={onLoadMore} disabled={loading}>
              {loading ? "Loading…" : "Load more"}
            </Button>
          ) : (
            <p className="text-xs uppercase tracking-wide text-slate-500">You’re all caught up</p>
          )}
        </div>
      </main>
    </div>
  );
}

interface StreamCardProps {
  event: StreamEvent;
  onOpenSession: (sessionId: string) => void;
}

function StreamCard({ event, onOpenSession }: StreamCardProps) {
  const occurredLabel = useMemo(() => new Date(event.createdAt).toLocaleString(), [event.createdAt]);

  if (event.eventType === "angry_lips_published") {
    const payload = event.payload ?? {};
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : null;
    const title = (payload.title as string) ?? "Untitled session";
    const summary = (payload.summary as string) ?? (payload.storyPreview as string) ?? "";
    const hostDisplay =
      (payload.hostDisplayName as string) ??
      (payload.hostUsername as string) ??
      (payload.hostId as string | null)?.slice(0, 6) ??
      "Host";
    const hostAvatar = (payload.hostAvatarUrl as string) ?? null;

    return (
      <article className="rounded-3xl border border-aurora/40 bg-aurora/5 p-6 shadow-lg shadow-aurora/10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "h-10 w-10 overflow-hidden rounded-full border border-aurora/40",
                hostAvatar ? "bg-black/20" : "bg-aurora/20"
              )}
            >
              {hostAvatar ? (
                <img src={hostAvatar} alt={hostDisplay} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-aurora-100">
                  {hostDisplay.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-aurora-100">Angry Lips publish</p>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-xs text-aurora-50">Hosted by {hostDisplay}</p>
            </div>
          </div>
          <span className="text-xs uppercase tracking-wide text-aurora-200">{occurredLabel}</span>
        </header>
        {summary ? <p className="mt-4 text-sm text-slate-100">{summary}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => sessionId && onOpenSession(sessionId)}
            disabled={!sessionId}
          >
            {sessionId ? "View session" : "Unavailable"}
          </Button>
        </div>
      </article>
    );
  }

  if (event.eventType === "chapter_added" || event.eventType === "story_saved" || event.eventType === "comment_added") {
    const payload = event.payload ?? {};
    const heading = event.eventType.replace(/_/g, " ");

    return (
      <article className="rounded-3xl border border-slate-800/60 bg-black/40 p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Story notification</p>
            <h2 className="text-lg font-semibold text-white">{heading}</h2>
          </div>
          <span className="text-xs uppercase tracking-wide text-slate-500">{occurredLabel}</span>
        </header>
        <pre className="mt-3 max-h-48 overflow-auto rounded-2xl border border-slate-800/60 bg-black/30 p-3 text-xs text-slate-300">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-slate-800/60 bg-black/40 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{event.eventType}</p>
          <h2 className="text-lg font-semibold text-white">New activity</h2>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-500">{occurredLabel}</span>
      </header>
      <pre className="mt-3 overflow-auto rounded-2xl border border-slate-800/60 bg-black/30 p-3 text-xs text-slate-300">
        {JSON.stringify(event.payload ?? {}, null, 2)}
      </pre>
    </article>
  );
}


