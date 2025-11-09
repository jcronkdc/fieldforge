import React from 'react';
import { StoryCard } from '../components/StoryCard';
import { RemixModal, type RemixMode } from '../components/RemixModal';
import { ProgressDots } from '../components/ProgressDots';
import { BranchTimelinePanel } from '../components/BranchTimelinePanel';
import { BranchEditor, type BranchDraft } from '../components/BranchEditor';
import { Button } from '../components/ui/Button';
import { stories } from '../data/sampleStories';
import type { TimelineNode } from '../data/sampleTimelines';

interface SwipeViewProps {
  currentIndex: number;
  currentStory: typeof stories[0];
  currentTimeline: TimelineNode[];
  worldTimelines: Record<string, TimelineNode[]>;
  isModalOpen: boolean;
  isTimelineOpen: boolean;
  isEditorOpen: boolean;
  editorMode: RemixMode;
  collabNotice: { branchId: string; invited: string[]; responseWindowMinutes: number | null } | null;
  handlers: any;
  onRemix: () => void;
  onCloseRemix: () => void;
  onOpenTimeline: () => void;
  onCloseTimeline: () => void;
  onModeSelected: (mode: RemixMode) => void;
  onDraftSave: (draft: BranchDraft) => void;
  onEditorClose: () => void;
  onBack: () => void;
  onOpenFeed: () => void;
  onOpenSettings: () => void;
}

export const SwipeView: React.FC<SwipeViewProps> = ({
  currentIndex,
  currentStory,
  currentTimeline,
  worldTimelines,
  isModalOpen,
  isTimelineOpen,
  isEditorOpen,
  editorMode,
  collabNotice,
  handlers,
  onRemix,
  onCloseRemix,
  onOpenTimeline,
  onCloseTimeline,
  onModeSelected,
  onDraftSave,
  onEditorClose,
  onBack,
  onOpenFeed,
  onOpenSettings,
}) => {
  return (
    <div {...handlers} className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white">
      <header className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-aurora/20 text-aurora">
            ✨
          </span>
          <span>MythaTron Worlds</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 lg:justify-end">
          <span className="hidden md:inline">Swipe ↓ to explore</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">Press R to remix</span>
          <span className="hidden md:inline">·</span>
          <Button type="button" size="sm" onClick={onOpenTimeline}>
            View timeline (T)
          </Button>
          <span>·</span>
          <span>
            {currentIndex + 1}/{stories.length}
          </span>
          <span>·</span>
          <Button type="button" size="sm" variant="secondary" onClick={onBack}>
            Back to Prologue
          </Button>
          <span>·</span>
          <Button type="button" size="sm" variant="ghost" onClick={onOpenFeed}>
            Aurora Feed
          </Button>
          <span>·</span>
          <Button type="button" size="sm" onClick={onOpenSettings}>
            Settings
          </Button>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100vh-120px)] items-center justify-center">
        {stories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            isActive={index === currentIndex}
            onRemix={onRemix}
            onViewTimeline={onOpenTimeline}
            style={{
              transform: `translateY(${(index - currentIndex) * 100}%) scale(${
                index === currentIndex ? 1 : 0.8
              })`,
              opacity: index === currentIndex ? 1 : 0,
              zIndex: stories.length - index,
            }}
          />
        ))}
      </main>

      {collabNotice && (
        <div className="fixed inset-x-0 top-24 z-20 mx-auto w-full max-w-lg animate-slide-down px-4">
          <div className="rounded-2xl border border-aurora/40 bg-black/90 p-4 text-sm shadow-xl backdrop-blur">
            <p className="font-semibold text-aurora-100">Collab session created!</p>
            <p className="mt-1 text-slate-300">
              Invited: {collabNotice.invited.join(", ")}
              {collabNotice.responseWindowMinutes && (
                <> · Response window: {formatResponseWindow(collabNotice.responseWindowMinutes)}</>
              )}
            </p>
          </div>
        </div>
      )}

      <footer className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center p-4">
        <ProgressDots count={stories.length} activeIndex={currentIndex} />
      </footer>

      <RemixModal
        isOpen={isModalOpen}
        onClose={onCloseRemix}
        onModeSelected={onModeSelected}
        story={currentStory}
      />

      <BranchTimelinePanel
        isOpen={isTimelineOpen}
        onClose={onCloseTimeline}
        world={currentStory.world}
        timeline={currentTimeline}
      />

      <BranchEditor
        isOpen={isEditorOpen}
        onClose={onEditorClose}
        onSave={onDraftSave}
        mode={editorMode}
        parentStory={currentStory}
      />
    </div>
  );
};

function formatResponseWindow(minutes: number | null): string {
  if (!minutes) return "Instant";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    if (hours % 24 === 0) {
      const days = hours / 24;
      return `${days} day${days === 1 ? "" : "s"}`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const hours = minutes / 60;
  return `${hours.toFixed(1)} hours`;
}

