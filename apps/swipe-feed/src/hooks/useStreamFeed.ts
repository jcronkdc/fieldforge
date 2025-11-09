import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchStreamFeed } from "../lib/feed";
import type { StreamEvent } from "../lib/types";

const PAGE_SIZE = 20;

export function useStreamFeed(enabled = true) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const initialized = useRef(false);

  const load = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const offset = reset ? 0 : offsetRef.current;
        const { items } = await fetchStreamFeed(PAGE_SIZE, offset);

        setEvents((prev) => (reset ? items : [...prev, ...items]));
        offsetRef.current = offset + items.length;
        setHasMore(items.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load stream"));
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    if (!enabled) return;
    if (initialized.current) return;
    initialized.current = true;
    load(true);
  }, [enabled, load]);

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    await load(true);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await load(false);
  }, [hasMore, loading, load]);

  return useMemo(
    () => ({
      events,
      loading,
      error,
      hasMore,
      refresh,
      loadMore,
      ready: initialized.current,
    }),
    [events, loading, error, hasMore, refresh, loadMore]
  );
}


