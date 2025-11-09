import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchFeedEvents, type FeedFilters } from "../lib/feed";
import type { FeedEvent } from "../lib/types";

const PAGE_SIZE = 20;

export function useFeedEvents(enabled = true, filters: FeedFilters = {}, userId: string | null = null) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const initialized = useRef(false);
  const filterRef = useRef<FeedFilters>({ ...filters });
  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (reset = false) => {
      if (loading) return;
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      setLoading(true);
      setError(null);

      try {
        const offset = reset ? 0 : offsetRef.current;
        const { items } = await fetchFeedEvents({
          ...filterRef.current,
          limit: PAGE_SIZE,
          offset,
          userId: userId ?? undefined,
        });
        
        // Check if request was aborted
        if (controller.signal.aborted) return;

        setEvents((prev) => (reset ? items : [...prev, ...items]));
        offsetRef.current = offset + items.length;
        setHasMore(items.length === PAGE_SIZE);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err instanceof Error ? err : new Error("Failed to load feed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [loading, userId]
  );

  useEffect(() => {
    filterRef.current = { ...filters };

    if (!enabled) {
      initialized.current = false;
      return;
    }

    initialized.current = true;
    offsetRef.current = 0;
    setHasMore(true);
    load(true);
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, filters, load]);

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    await load(true);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await load(false);
  }, [hasMore, loading, load]);

  const setFilters = useCallback((next: Partial<FeedFilters>) => {
    filterRef.current = { ...filterRef.current, ...next };
    offsetRef.current = 0;
    setHasMore(true);
    load(true);
  }, [load]);

  return useMemo(
    () => ({
      events,
      loading,
      error,
      hasMore,
      refresh,
      loadMore,
      setFilters,
      ready: initialized.current,
    }),
    [events, loading, error, hasMore, refresh, loadMore, setFilters]
  );
}


