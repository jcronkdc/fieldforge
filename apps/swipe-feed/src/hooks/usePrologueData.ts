import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../lib/profile";
import {
  fetchUserAngryLipsSessions,
  fetchCharacters,
  fetchStoryNotifications,
  fetchTimeline,
  type AngryLipsSessionSummary,
  type CharacterSummary,
  type StoryNotification,
  type TimelineNode,
} from "../lib/prologueApi";
import { fetchAngryLipsFeed } from "../lib/angryLipsApi";
import {
  fetchBookworms,
  fetchConnectionRequests,
  type BookwormConnection,
  type ConnectionRequest,
  type ConnectionStats,
} from "../lib/social";
import type { AngryLipsFeedEntryResponse } from "../lib/types";
import { fetchMythacoinSummary, type MythacoinSummary } from "../lib/mythacoin";

interface PrologueData {
  feed: TimelineNode[];
  notifications: StoryNotification[];
  characters: CharacterSummary[];
  sessions: AngryLipsSessionSummary[];
  bookworms: BookwormConnection[];
  incomingRequests: ConnectionRequest[];
  outgoingRequests: ConnectionRequest[];
  connectionStats: ConnectionStats | null;
  mythacoin: MythacoinSummary | null;
  publicFeed: AngryLipsFeedEntryResponse[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  worldId: string;
}

const DEFAULT_WORLD_ID = "City of Thousand Codes";

export function usePrologueData(profile: UserProfile | null): PrologueData {
  const [feed, setFeed] = useState<TimelineNode[]>([]);
  const [notifications, setNotifications] = useState<StoryNotification[]>([]);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [sessions, setSessions] = useState<AngryLipsSessionSummary[]>([]);
  const [bookworms, setBookworms] = useState<BookwormConnection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const [mythacoinSummary, setMythacoinSummary] = useState<MythacoinSummary | null>(null);
  const [publicFeed, setPublicFeed] = useState<AngryLipsFeedEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const worldId = useMemo(() => {
    // TODO: allow users to set preferred world. For now, default to flagship world.
    return DEFAULT_WORLD_ID;
  }, [profile]);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!profile) {
      setFeed([]);
      setNotifications([]);
      setCharacters([]);
      setSessions([]);
      setBookworms([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setConnectionStats(null);
      setPublicFeed([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [
          timelineNodes,
          recentNotifications,
          characterList,
          sessionList,
          bookwormData,
          inboundRequests,
          outboundRequests,
          summary,
          publicEntries,
        ] = await Promise.all([
          fetchTimeline(worldId, 6),
          fetchStoryNotifications(10),
          fetchCharacters(worldId, 6),
          fetchUserAngryLipsSessions(profile.user_id, 4),
          fetchBookworms(profile.user_id, 10),
          fetchConnectionRequests(profile.user_id, "inbound"),
          fetchConnectionRequests(profile.user_id, "outbound"),
          fetchMythacoinSummary(profile.user_id),
          fetchAngryLipsFeed(6, 0),
        ]);

        if (cancelled) return;

        setFeed(timelineNodes);
        setNotifications(recentNotifications);
        setCharacters(characterList);
        setSessions(sessionList);
        setBookworms(bookwormData.items ?? []);
        setConnectionStats(bookwormData.stats ?? null);
        setIncomingRequests(inboundRequests);
        setOutgoingRequests(outboundRequests);
        setMythacoinSummary(summary);
        setPublicFeed(publicEntries.items ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Failed to load dashboard data"));
        setFeed([]);
        setNotifications([]);
        setCharacters([]);
        setSessions([]);
        setBookworms([]);
        setConnectionStats(null);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setMythacoinSummary(null);
        setPublicFeed([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, worldId, refreshKey]);

  return {
    feed,
    notifications,
    characters,
    sessions,
    bookworms,
    incomingRequests,
    outgoingRequests,
    connectionStats,
    mythacoin: mythacoinSummary,
    publicFeed,
    stories: [], // TODO: Fetch actual stories
    loading,
    error,
    refresh,
    worldId,
  };
}



