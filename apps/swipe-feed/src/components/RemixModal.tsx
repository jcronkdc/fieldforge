import { FC } from "react";
import type { StoryHighlight } from "../data/sampleStories";
import { Button } from "./ui/Button";

export type RemixMode = "assist" | "branch" | "blank";

interface RemixModalProps {
  story: StoryHighlight;
  open: boolean;
  onClose: () => void;
  onModeSelected: (mode: RemixMode) => void;
}

const modes: Array<{
  id: RemixMode;
  title: string;
  description: string;
}> = [
  {
    id: "assist",
    title: "Co-author Assist",
    description: "Let the AI suggest the next beats, then tweak the prose to your liking.",
  },
  {
    id: "branch",
    title: "Branch the Timeline",
    description: "Choose from alternate realities and explore the unexpected what-ifs.",
  },
  {
    id: "blank",
    title: "From Scratch",
    description: "Start with a fresh page and build a brand-new arc in this universe.",
  },
];

export const RemixModal: FC<RemixModalProps> = ({ story, open, onClose, onModeSelected }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0b1220] p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Remix</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{story.title}</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-300">
              Pick your creative lane. We’ll log your choice so you can jump back into a draft
              later.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            iconOnly
            onClick={onClose}
            aria-label="Close remix dialog"
          >
            ✕
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeSelected(mode.id)}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-700 bg-white/5 p-4 text-left transition hover:border-aurora hover:bg-aurora/10"
            >
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-aurora">
                  {mode.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">{mode.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-aurora/80 group-hover:text-aurora">
                Enter {mode.id} editor →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

