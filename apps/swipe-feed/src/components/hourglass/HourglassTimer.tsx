import { FC, memo } from "react";
import clsx from "clsx";
import { useCountdown } from "./useCountdown";

export type HourglassSize = "lg" | "sm" | "chip";

interface HourglassTimerProps {
  expiresAt: string | number | Date;
  now?: Date;
  size?: HourglassSize;
  label?: string;
  cta?: string;
  className?: string;
}

export const HourglassTimer: FC<HourglassTimerProps> = memo(
  ({ expiresAt, now, size = "lg", label, cta, className }) => {
    const { hours, minutes, seconds, isExpired, isWarning } = useCountdown({ expiresAt, now });

    return (
      <div
        className={clsx("hourglass-shell", className)}
        data-size={size}
        data-state={isExpired ? "expired" : isWarning ? "warning" : "active"}
      >
        <HourglassIcon size={size} />
        <div className="timer-readout">{formatTime(hours, minutes, seconds)}</div>
        {label ? <div className="label text-xs uppercase tracking-wide text-slate-400">{label}</div> : null}
        {cta ? <div className="cta">{cta}</div> : null}
      </div>
    );
  }
);

HourglassTimer.displayName = "HourglassTimer";

function formatTime(hours: number, minutes: number, seconds: number): string {
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

const HourglassIcon: FC<{ size: HourglassSize }> = ({ size }) => (
  <svg
    className="hourglass-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 2h12"></path>
    <path d="M6 22h12"></path>
    <path d="M6 2c0 6 6 6 6 10s-6 4-6 10"></path>
    <path d="M18 2c0 6-6 6-6 10s6 4 6 10"></path>
  </svg>
);


