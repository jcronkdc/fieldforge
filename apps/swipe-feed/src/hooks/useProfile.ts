import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "../lib/profile";
import { fetchProfile } from "../lib/profile";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const refresh = useCallback(() => {
    setRefreshFlag((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProfile(userId)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load profile"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, refreshFlag]);

  return { profile, setProfile, loading, error, refresh };
}


