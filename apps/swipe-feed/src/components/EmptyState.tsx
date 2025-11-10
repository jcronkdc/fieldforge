import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({
  title = "Nothing here yet",
  body = "Add a new item to get started.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/5 bg-surface/40 p-8 text-center">
      <h3 className="text-h2 on-surface">{title}</h3>
      <p className="on-surface-muted max-w-prose">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
