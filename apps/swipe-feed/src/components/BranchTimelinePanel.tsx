import { FC, useMemo } from "react";
import clsx from "clsx";
import type { TimelineNode } from "../data/sampleTimelines";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { HourglassTimer } from "./hourglass/HourglassTimer";

interface BranchTimelinePanelProps {
  world: string;
  timeline: TimelineNode[];
  open: boolean;
  onClose: () => void;
}

export const BranchTimelinePanel: FC<BranchTimelinePanelProps> = ({
  world,
  timeline,
  open,
  onClose,
}) => {
  const ranked = useMemo(() => enrichTimeline(timeline), [timeline]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/60 backdrop-blur">
      <aside className="relative h-full w-full max-w-lg overflow-y-auto border-l border-slate-800 bg-[#050a16]/95 px-6 py-8 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">World Timeline</p>
            <h2 className="text-xl font-semibold text-white">{world}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Explore canonical and fan-created branches. Canon entries glow aurora.
            </p>
          </div>
          <Button type="button" size="sm" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className="mt-6 space-y-4">
          {ranked.map((node) => (
            <TimelineRow key={node.id} node={node} />
          ))}
        </div>
      </aside>
    </div>
  );
};

interface RankedNode extends TimelineNode {
  depth: number;
  branchNumber: string;
}

const TimelineRow: FC<{ node: RankedNode }> = ({ node }) => (
  <div
    className={clsx(
      "rounded-2xl border px-4 py-3 transition",
      node.isCanon
        ? "border-aurora/70 bg-aurora/10 text-white"
        : "border-slate-700 bg-white/5 text-slate-200"
    )}
    style={{ marginLeft: `${node.depth * 24}px` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-aurora">
          {node.branchNumber}
        </span>
        <h3 className="text-sm font-semibold">{node.title}</h3>
      </div>
      <div className="text-xs text-slate-300">{node.createdAt}</div>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
      <span>By {node.author}</span>
      <span>·</span>
      <span>{node.remixCount} remixes</span>
      {node.tags.map((tag) => (
        <Pill key={tag} variant="subtle" className="normal-case text-xs">
          #{tag}
        </Pill>
      ))}
      {node.collabInvites && node.collabInvites.length > 0 ? (
        <Pill variant="aurora" className="normal-case text-xs">
          Invite-only · {node.collabInvites.length} collaborator(s)
        </Pill>
      ) : null}
      {node.responseWindowMinutes ? (
        <HourglassTimer
          size="chip"
          expiresAt={resolveExpiry(node)}
          className="normal-case"
        />
      ) : null}
      {node.timeoutStrategy === "ai_autofill" ? (
        <Pill variant="aurora" className="normal-case text-xs">
          AI fallback ready
        </Pill>
      ) : null}
    </div>
  </div>
);

function resolveExpiry(node: TimelineNode): number {
  if (node.activeTurnExpiresAt) {
    return new Date(node.activeTurnExpiresAt).getTime();
  }
  if (node.responseWindowMinutes) {
    return Date.now() + node.responseWindowMinutes * 60 * 1000;
  }
  return Date.now();
}

function enrichTimeline(nodes: TimelineNode[]): RankedNode[] {
  const depthMap: Record<string, number> = {};
  const childrenMap: Record<string, TimelineNode[]> = {};

  nodes.forEach((node) => {
    if (!childrenMap[node.parentId ?? "root"]) {
      childrenMap[node.parentId ?? "root"] = [];
    }
    childrenMap[node.parentId ?? "root"].push(node);
  });

  const result: RankedNode[] = [];

  function traverse(id: string | undefined, depth: number, indexPrefix = "") {
    const key = id ?? "root";
    const children = childrenMap[key] ?? [];
    children
      .sort((a, b) => a.sequence - b.sequence)
      .forEach((child, index) => {
        const branchNumber = indexPrefix ? `${indexPrefix}.${index + 1}` : `${index + 1}`;
        depthMap[child.id] = depth;
        result.push({
          ...child,
          depth,
          branchNumber,
        });
        traverse(child.id, depth + 1, branchNumber);
      });
  }

  traverse(undefined, 0);
  return result;
}

