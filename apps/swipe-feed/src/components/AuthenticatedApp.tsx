import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { usePrologueData } from '../hooks/usePrologueData';
import { useStreamFeed } from '../hooks/useStreamFeed';
import { useFeedEvents } from '../hooks/useFeedEvents';
import { ProfileSetup } from './profile/ProfileSetup';
import { ViewRouter } from '../views/ViewRouter';
import { Button } from './ui/Button';
import { FullPageLoader } from './LoadingStates';
import { FeedbackWidget } from './feedback/FeedbackWidget';
import { BalanceWidget } from './sparks/BalanceWidget';
import { sendConnectionRequest, respondConnectionRequest, removeBookworm } from '../lib/social';
import { Analytics } from '../utils/analyticsTracker';
import { respondAngryLipsInvitation } from '../lib/angryLipsApi';
import { track } from '../lib/analytics';
import { stories } from '../data/sampleStories';
import { timelines, type TimelineMap, type TimelineNode } from '../data/sampleTimelines';
import type { RemixMode } from './RemixModal';
import type { BranchDraft } from './BranchEditor';
import type { UserProfile } from '../lib/profile';

type FocusedView = "prologue" | "feed" | "stream" | "swipe" | "messages" | 
                   "das-preferences" | "das-voting" | "das-transparency" | "settings";

function parseFocusedView(hash: string | null | undefined): FocusedView {
  if (typeof hash !== "string" || hash.trim() === "" || hash === "#") {
    return "prologue";
  }

  const normalized = hash.startsWith("#") ? hash.slice(1).trim().toLowerCase() : hash.trim().toLowerCase();

  if (normalized === "prologue" || normalized === "feed" || normalized === "stream" || normalized === "swipe" || 
      normalized === "messages" || normalized === "das-preferences" || normalized === "das-voting" || 
      normalized === "das-transparency" || normalized === "settings") {
    return normalized as FocusedView;
  }

  return "prologue";
}

function cloneTimelines(map: TimelineMap): TimelineMap {
  return Object.entries(map).reduce((acc, [world, nodes]) => {
    acc[world] = nodes.map((node) => ({ ...node }));
    return acc;
  }, {} as TimelineMap);
}

export const AuthenticatedApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, setProfile, error: profileError } = useProfile(user?.id);

  // Core state - ALL hooks must be called unconditionally
  const [profileState, setProfileState] = useState<UserProfile | null>(null);
  const [focusedView, setFocusedView] = useState<FocusedView>(() => {
    const view = parseFocusedView(location.hash);
    Analytics.trackPageView(view);
    return view;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedFilters, setFeedFilters] = useState<{ search: string; sort: "latest" | "popular"; eventTypes: string[] }>(
    { search: "", sort: "latest", eventTypes: [] }
  );
  const [feedSearchDraft, setFeedSearchDraft] = useState("");

  // Swipe view state
  const [worldTimelines, setWorldTimelines] = useState<TimelineMap>(() => cloneTimelines(timelines));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<RemixMode>("assist");
  const [collabNotice, setCollabNotice] = useState<{ branchId: string; invited: string[]; responseWindowMinutes: number | null } | null>(null);

  // Refs for history navigation
  const focusedViewRef = useRef<FocusedView>(parseFocusedView(location.hash));
  const historyNavigationRef = useRef(false);

  // Data hooks - always called
  const prologueData = usePrologueData(profileState);
  const streamFeed = useStreamFeed(true);
  const feedState = useFeedEvents(focusedView === "feed", feedFilters, profileState?.user_id ?? null);

  // Swipe view computed values
  const currentStory = useMemo(() => stories[currentIndex], [currentIndex]);
  const currentTimeline = useMemo(
    () => worldTimelines[currentStory.world]?.find((t) => t.id === currentStory.id) ?? null,
    [currentStory.id, currentStory.world, worldTimelines]
  );

  // Swipe view callbacks
  const goToIndex = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(stories.length - 1, nextIndex));
      if (clampedIndex !== currentIndex) {
        setCurrentIndex(clampedIndex);
        track("feed_swipe", {
          story_id: stories[clampedIndex].id,
          position: clampedIndex + 1,
          tags: stories[clampedIndex].tags,
        });
      }
    },
    [currentIndex]
  );

  const goNext = useCallback(() => goToIndex(currentIndex + 1), [currentIndex, goToIndex]);
  const goPrev = useCallback(() => goToIndex(currentIndex - 1), [currentIndex, goToIndex]);

  const handlers = useSwipeable({
    onSwipedUp: goNext,
    onSwipedDown: goPrev,
    delta: 50,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  const openRemix = useCallback(() => {
    setIsModalOpen(true);
    track("remix_click", {
      story_id: currentStory.id,
      entry_point: "feed",
    });
  }, [currentStory.id]);

  const closeRemix = useCallback(() => setIsModalOpen(false), []);

  const openTimeline = useCallback(() => {
    setIsTimelineOpen(true);
    track("timeline_open", {
      world: currentStory.world,
      story_id: currentStory.id,
    });
  }, [currentStory.id, currentStory.world]);

  const closeTimeline = useCallback(() => setIsTimelineOpen(false), []);

  const handleModeSelected = useCallback(
    (mode: RemixMode) => {
      setEditorMode(mode);
      setIsModalOpen(false);
      setIsEditorOpen(true);
      track("remix_editor_open", {
        story_id: currentStory.id,
        mode,
      });
    },
    [currentStory.id]
  );

  const handleDraftSave = useCallback(
    (draft: BranchDraft) => {
      const branchId = `branch-${Date.now()}`;
      const wordCount = draft.content.trim().length
        ? draft.content.trim().split(/\s+/).length
        : 0;

      track("remix_complete", {
        story_id: currentStory.id,
        mode: editorMode,
        draft_word_count: wordCount,
      });

      const newNode: TimelineNode = {
        id: branchId,
        parentId: currentStory.id,
        title: draft.title,
        author: "@you",
        remixCount: 0,
        isCanon: draft.isCanon,
        tags: draft.tags,
        createdAt: "Just now",
        sequence: Date.now(),
        collabInvites: draft.collabEnabled ? draft.invites : undefined,
        responseWindowMinutes: draft.collabEnabled ? draft.responseWindowMinutes ?? undefined : undefined,
        timeoutStrategy: draft.collabEnabled ? "ai_autofill" : undefined,
      };

      setWorldTimelines((prev) => {
        const next = cloneTimelines(prev);
        const worldBranches = next[currentStory.world] ?? [];
        next[currentStory.world] = [...worldBranches, newNode];
        return next;
      });

      if (draft.collabEnabled && draft.invites.length > 0) {
        track("collab_session_created", {
          branch_id: branchId,
          world: currentStory.world,
          invited: draft.invites,
          response_window_minutes: draft.responseWindowMinutes,
        });
        setCollabNotice({
          branchId,
          invited: draft.invites,
          responseWindowMinutes: draft.responseWindowMinutes ?? null,
        });
      }

      setIsEditorOpen(false);
    },
    [currentStory.id, currentStory.world, editorMode]
  );

  const handleEditorClose = useCallback(() => setIsEditorOpen(false), []);

  // Social callbacks
  const handleInviteByUsername = useCallback(
    async (username: string, message?: string) => {
      if (!profileState || !profileState.user_id) {
        throw new Error("Profile not ready");
      }
      try {
        await sendConnectionRequest({
          requesterId: profileState.user_id,
          targetUsername: username,
          message,
        });
        prologueData.refresh();
      } catch (error) {
        console.error("Failed to send connection request", error);
        throw (error instanceof Error ? error : new Error("Failed to send request"));
      }
    },
    [profileState, prologueData.refresh]
  );

  const handleRespondRequest = useCallback(
    async (requestId: string, action: "accept" | "decline" | "cancel") => {
      if (!profileState || !profileState.user_id) {
        throw new Error("Profile not ready");
      }
      try {
        await respondConnectionRequest({
          requestId,
          userId: profileState.user_id,
          action,
        });
        prologueData.refresh();
      } catch (error) {
        console.error("Failed to update connection request", error);
        throw (error instanceof Error ? error : new Error("Failed to update request"));
      }
    },
    [profileState, prologueData.refresh]
  );

  const handleRemoveBookworm = useCallback(
    async (friendId: string) => {
      if (!profileState || !profileState.user_id) {
        throw new Error("Profile not ready");
      }
      try {
        await removeBookworm(profileState.user_id, friendId);
        prologueData.refresh();
      } catch (error) {
        console.error("Failed to remove BookWorm", error);
        throw (error instanceof Error ? error : new Error("Failed to remove BookWorm"));
      }
    },
    [profileState, prologueData.refresh]
  );

  const handleSessionInviteResponse = useCallback(
    async (sessionId: string, action: "accept" | "decline" | "left") => {
      if (!profileState || !profileState.user_id) {
        throw new Error("Profile not ready");
      }
      try {
        await respondAngryLipsInvitation(sessionId, profileState.user_id, action);
        prologueData.refresh();
      } catch (error) {
        console.error("Failed to update Angry Lips invitation", error);
        throw (error instanceof Error ? error : new Error("Failed to update invitation"));
      }
    },
    [profileState, prologueData.refresh]
  );

  const handleOpenFeedSession = useCallback((sessionId: string) => {
    console.log("Opening feed session:", sessionId);
    // TODO: Implement opening Angry Lips session from feed
  }, []);

  const handleResumeSession = useCallback((sessionId: string) => {
    console.log("Resuming session:", sessionId);
    // TODO: Implement resuming Angry Lips session
  }, []);

  // Effects
  useEffect(() => {
    focusedViewRef.current = focusedView;
  }, [focusedView]);

  useEffect(() => {
    const handlePop = (event: PopStateEvent) => {
      const fromState = typeof event.state?.view === "string" ? event.state.view : undefined;
      const nextView = parseFocusedView(fromState ?? window.location.hash);

      if (nextView !== focusedViewRef.current) {
        historyNavigationRef.current = true;
        setFocusedView(nextView);
      }
    };
    window.addEventListener("popstate", handlePop);
    
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '') {
      const existingState = window.history.state ?? {};
      window.history.replaceState({ ...existingState, view: focusedViewRef.current }, "", window.location.hash);
    }
    
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    if (historyNavigationRef.current) {
      historyNavigationRef.current = false;
      return;
    }
    if (window.location.hash || focusedView !== "prologue") {
      window.history.pushState({ view: focusedView }, "", `#${focusedView}`);
    }
  }, [focusedView]);

  useEffect(() => {
    if (profile) {
      setProfileState(profile);
    }
  }, [profile]);

  useEffect(() => {
    setFeedSearchDraft(feedFilters.search);
  }, [feedFilters.search]);

  useEffect(() => {
    if (focusedView === "feed" && feedState.ready) {
      feedState.refresh();
    }
  }, [focusedView, feedState.ready, feedState.refresh]);

  useEffect(() => {
    if (focusedView === "stream" && streamFeed.ready) {
      streamFeed.refresh();
    }
  }, [focusedView, streamFeed.ready, streamFeed.refresh]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (focusedView === "swipe") {
        if (event.key === "ArrowUp") {
          goPrev();
        } else if (event.key === "ArrowDown") {
          goNext();
        } else if (event.key === "r" || event.key === "R") {
          openRemix();
        } else if (event.key === "t" || event.key === "T") {
          openTimeline();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedView, goNext, goPrev, openRemix, openTimeline]);

  useEffect(() => {
    if (!collabNotice) return;
    const timer = window.setTimeout(() => setCollabNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [collabNotice]);

  // Loading states
  if (profileLoading) {
    return <FullPageLoader message="Loading your profile…" />;
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white">
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-white">We hit a snag loading your profile.</h2>
          <p className="text-sm text-slate-300">Please refresh the page or try signing out and back in.</p>
          <Button type="button" variant="primary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (!profileState) {
    if (!user) {
      return <FullPageLoader message="Loading user data…" />;
    }
    return (
      <ProfileSetup
        user={user}
        onComplete={(next) => {
          setProfile(next);
          setProfileState(next);
        }}
      />
    );
  }

  // Prepare swipe data
  const swipeData = {
    currentIndex,
    currentStory,
    currentTimeline: currentTimeline || [],
    worldTimelines,
    isModalOpen,
    isTimelineOpen,
    isEditorOpen,
    editorMode,
    collabNotice,
    handlers,
    onRemix: openRemix,
    onCloseRemix: closeRemix,
    onOpenTimeline: openTimeline,
    onCloseTimeline: closeTimeline,
    onModeSelected: handleModeSelected,
    onDraftSave: handleDraftSave,
    onEditorClose: handleEditorClose,
  };

  return (
    <>
      <ViewRouter
        focusedView={focusedView}
        setFocusedView={setFocusedView}
        profile={profileState}
        userId={profileState.user_id}
        prologueData={prologueData}
        feedState={feedState}
        feedFilters={feedFilters}
        setFeedFilters={setFeedFilters}
        feedSearchDraft={feedSearchDraft}
        setFeedSearchDraft={setFeedSearchDraft}
        streamFeed={streamFeed}
        swipeData={swipeData}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        onInviteByUsername={handleInviteByUsername}
        onRespondRequest={handleRespondRequest}
        onRemoveBookworm={handleRemoveBookworm}
        onSessionRespond={handleSessionInviteResponse}
        onOpenFeedSession={handleOpenFeedSession}
        onResumeSession={handleResumeSession}
      />
      <FeedbackWidget pageContext={focusedView} />
      <BalanceWidget position="top-right" compact={false} />
    </>
  );
};

