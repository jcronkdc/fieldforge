import { useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  expiresAt: string | number | Date;
  now?: Date;
  tickRateMs?: number;
}

interface CountdownState {
  totalMs: number;
  minutes: number;
  seconds: number;
  hours: number;
  isExpired: boolean;
  isWarning: boolean;
}

const DEFAULT_TICK_RATE = 500;
const WARNING_THRESHOLD_MS = 60_000;

function parseExpiry(expiresAt: string | number | Date): number {
  if (expiresAt instanceof Date) return expiresAt.getTime();
  if (typeof expiresAt === "string") return new Date(expiresAt).getTime();
  return expiresAt;
}

export function useCountdown({ expiresAt, now, tickRateMs = DEFAULT_TICK_RATE }: UseCountdownOptions): CountdownState {
  const [currentNow, setCurrentNow] = useState(now ?? new Date());
  const frameRef = useRef<number>();
  const lastTickRef = useRef<number>(0);

  const expiryMs = parseExpiry(expiresAt);

  useEffect(() => {
    if (now) {
      setCurrentNow(now);
      return;
    }

    let mounted = true;

    const loop = (timestamp: number) => {
      if (!mounted) return;
      if (!lastTickRef.current) {
        lastTickRef.current = timestamp;
      }

      if (timestamp - lastTickRef.current >= tickRateMs) {
        setCurrentNow(new Date());
        lastTickRef.current = timestamp;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [now, tickRateMs]);

  const totalMs = Math.max(0, expiryMs - currentNow.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalMs === 0;
  const isWarning = !isExpired && totalMs <= WARNING_THRESHOLD_MS;

  return {
    totalMs,
    minutes,
    seconds,
    hours,
    isExpired,
    isWarning,
  };
}


