import { FC } from "react";
import clsx from "clsx";

interface ProgressDotsProps {
  total: number;
  currentIndex: number;
}

export const ProgressDots: FC<ProgressDotsProps> = ({ total, currentIndex }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, index) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={clsx(
          "h-2.5 w-2.5 rounded-full transition",
          index === currentIndex ? "bg-aurora" : "bg-slate-700"
        )}
      />
    ))}
  </div>
);

