import { FC } from "react";
import type { StoryHighlight } from "../data/sampleStories";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { Badge } from "./ui/Badge";
import { StatBlock } from "./ui/StatBlock";

interface StoryCardProps {
  story: StoryHighlight;
  onRemix: () => void;
}

export const StoryCard: FC<StoryCardProps> = ({ story, onRemix }) => {
  return (
    <article className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-white/5 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10" aria-hidden />
      <div className="relative flex flex-col gap-5 p-8">
        <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-slate-300">
          <Pill variant="aurora" className="font-semibold normal-case text-sm text-aurora">
            {story.genre}
          </Pill>
          <div className="flex gap-2 text-slate-500">
            {story.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-white">{story.title}</h1>
          <p className="text-lg leading-relaxed text-slate-200">{story.snippet}</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          <StatBlock label="Mood" value={story.mood} />
          <StatBlock label="Pace" value={story.paceBucket} />
          <StatBlock label="Estimated read" value={`${story.readTime} min`} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onRemix} variant="primary">
            <span>Remix Story</span>
            <span aria-hidden>↻</span>
          </Button>
          <div className="text-xs text-slate-400">Press R to remix instantly</div>
        </div>
      </div>

      {story.artUrl ? (
        <img
          src={story.artUrl}
          alt="Story artwork"
          className="h-56 w-full object-cover"
          loading="lazy"
        />
      ) : null}

      <footer className="flex items-center justify-between border-t border-slate-800/60 bg-black/20 px-6 py-4 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-200">{story.world}</span>
          <span className="mx-2">·</span>
          <span>{story.author}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge label="Community" value={`${story.remixCount} remixes`} />
          <Badge label="Canon" value={story.isCanon ? "Core" : "Fan branch"} highlight={story.isCanon} />
        </div>
      </footer>
    </article>
  );
};
