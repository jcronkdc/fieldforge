import React, { useCallback, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { FeedCard } from '../components/feed/FeedCard';
import clsx from 'clsx';

interface FeedViewProps {
  feedState: {
    events: any[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    refresh: () => void;
    loadMore: () => void;
  };
  feedFilters: {
    search: string;
    sort: 'latest' | 'popular';
    eventTypes: string[];
  };
  setFeedFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    sort: 'latest' | 'popular';
    eventTypes: string[];
  }>>;
  feedSearchDraft: string;
  setFeedSearchDraft: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onOpenSession: (sessionId: string) => void;
  currentUserId: string;
}

export const FeedView: React.FC<FeedViewProps> = ({
  feedState,
  feedFilters,
  setFeedFilters,
  feedSearchDraft,
  setFeedSearchDraft,
  onBack,
  onOpenSession,
  currentUserId,
}) => {
  const {
    events: feedEvents,
    loading: feedLoading,
    error: feedError,
    hasMore: feedHasMore,
    refresh: refreshFeed,
    loadMore: loadMoreFeed,
  } = feedState;

  const storyEventTypes = useMemo(() => ["story_branch_created", "chapter_added", "story_saved", "comment_added"], []);
  const eventTypeSet = useMemo(() => new Set(feedFilters.eventTypes), [feedFilters.eventTypes]);
  const isAngryLipsActive = eventTypeSet.has("angry_lips_published");
  const isStoryActive = storyEventTypes.every((type) => eventTypeSet.has(type));
  const isBookwormActive = eventTypeSet.has("connection_accepted");

  const toggleEventTypes = useCallback(
    (types: string[]) => {
      setFeedFilters((prev) => {
        const next = new Set(prev.eventTypes);
        const shouldRemove = types.every((type) => next.has(type));
        types.forEach((type) => {
          if (shouldRemove) {
            next.delete(type);
          } else {
            next.add(type);
          }
        });
        return { ...prev, eventTypes: Array.from(next) };
      });
    },
    [setFeedFilters]
  );

  const applySearch = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      setFeedFilters((prev) => ({ ...prev, search: feedSearchDraft.trim() }));
    },
    [feedSearchDraft, setFeedFilters]
  );

  const clearSearch = useCallback(() => {
    setFeedSearchDraft("");
    setFeedFilters((prev) => ({ ...prev, search: "" }));
  }, [setFeedSearchDraft, setFeedFilters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b19] via-[#07132a] to-[#020611] text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-[#050b19]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Aurora Feed</p>
            <h1 className="text-2xl font-semibold text-white">Across the MythaTron network</h1>
            <p className="text-sm text-slate-400">Story beats, Angry Lips drops, and BookWorm signals in one scroll.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={onBack}>
              Back to Prologue
            </Button>
            <Button type="button" size="sm" onClick={refreshFeed}>
              Refresh
            </Button>
          </div>
        </div>

        <section className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 pb-4">
          <form onSubmit={applySearch} className="flex flex-1 items-center gap-2">
            <input
              type="text"
              placeholder="Search stories, authors, or tags…"
              value={feedSearchDraft}
              onChange={(e) => setFeedSearchDraft(e.target.value)}
              className="flex-1 rounded-full border border-slate-800 bg-black/40 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
            />
            {feedSearchDraft && (
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            )}
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
          <select
            value={feedFilters.sort}
            onChange={(event) =>
              setFeedFilters((prev) => ({ ...prev, sort: event.target.value === "popular" ? "popular" : "latest" }))
            }
            className="rounded-full border border-slate-800 bg-black/40 px-3 py-2 text-xs text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
          </select>
        </section>

        <section className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-2 px-4 pb-4 text-xs uppercase tracking-wide text-slate-400">
          <span>Filter:</span>
          <button
            type="button"
            onClick={() => toggleEventTypes(["angry_lips_published"])}
            className={clsx(
              "rounded-full border px-3 py-1 transition",
              isAngryLipsActive ? "border-aurora/60 bg-aurora/10 text-aurora-100" : "border-slate-800 bg-black/40 hover:border-aurora/40 hover:text-aurora-100"
            )}
          >
            Angry Lips
          </button>
          <button
            type="button"
            onClick={() => toggleEventTypes(storyEventTypes)}
            className={clsx(
              "rounded-full border px-3 py-1 transition",
              isStoryActive ? "border-aurora/60 bg-aurora/10 text-aurora-100" : "border-slate-800 bg-black/40 hover:border-aurora/40 hover:text-aurora-100"
            )}
          >
            Stories
          </button>
          <button
            type="button"
            onClick={() => toggleEventTypes(["connection_accepted"])}
            className={clsx(
              "rounded-full border px-3 py-1 transition",
              isBookwormActive ? "border-aurora/60 bg-aurora/10 text-aurora-100" : "border-slate-800 bg-black/40 hover:border-aurora/40 hover:text-aurora-100"
            )}
          >
            BookWorms
          </button>
        </section>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        {feedError ? (
          <div className="rounded-3xl border border-rose-500/50 bg-rose-900/30 p-4 text-sm text-rose-100">
            <p className="font-semibold">Something caught fire.</p>
            <p className="mt-1 text-rose-200/80">{feedError.message}</p>
          </div>
        ) : null}

        {feedEvents.length === 0 && !feedLoading ? (
          <div className="rounded-3xl border border-slate-800/60 bg-black/40 p-6 text-center text-sm text-slate-300">
            <p>No public activity yet. Publish an Angry Lips session or branch to light up the feed.</p>
          </div>
        ) : null}

        {feedEvents.map((event) => (
          <FeedCard
            key={`${event.eventType}-${event.id}`}
            event={event}
            currentUserId={currentUserId}
            onOpenSession={onOpenSession}
            onRequireAuth={() => {}}
          />
        ))}

        {feedLoading && feedEvents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-aurora/40 border-t-aurora" aria-hidden />
          </div>
        ) : null}

        <div className="flex items-center justify-center py-6">
          {feedHasMore ? (
            <Button type="button" variant="secondary" onClick={loadMoreFeed} disabled={feedLoading}>
              {feedLoading ? "Loading…" : "Load more"}
            </Button>
          ) : (
            <p className="text-xs uppercase tracking-wide text-slate-500">You're all caught up</p>
          )}
        </div>
      </main>
    </div>
  );
};

