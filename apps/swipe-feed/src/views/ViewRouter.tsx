import React from 'react';
import { PrologueDashboard } from '../components/prologue/PrologueDashboard';
import { FuturisticDashboard } from '../components/prologue/FuturisticDashboard';
import { MythaStream } from '../components/stream/MythaStream';
import { MessagingPanel } from '../components/messaging/MessagingPanel';
import { DasPreferencesPanel } from '../components/das/DasPreferencesPanel';
import { DasVotingPanel } from '../components/das/DasVotingPanel';
import { DasTransparencyDashboard } from '../components/das/DasTransparencyDashboard';
import { AccountSettingsPanel } from '../components/profile/AccountSettingsPanel';
import { FeedView } from './FeedView';
import { FuturisticFeedView } from './FuturisticFeedView';
import { SwipeView } from './SwipeView';
import { AngryLipsTestSuite } from '../components/test/AngryLipsTestSuite';
import { MasterTestSuite } from '../components/test/MasterTestSuite';
import { CrashRecoveryTest } from '../components/test/CrashRecoveryTest';
import { InviteFriends } from '../components/invite/InviteFriends';
import type { UserProfile } from '../lib/profile';

type FocusedView = "prologue" | "feed" | "stream" | "swipe" | "messages" | 
                   "das-preferences" | "das-voting" | "das-transparency" | "settings" | "angry-lips-test" | "master-test" | "crash-test" | "invite-friends";

interface ViewRouterProps {
  focusedView: FocusedView;
  setFocusedView: (view: FocusedView) => void;
  
  // User data
  profile: UserProfile;
  userId: string;
  
  // Prologue data
  prologueData: any;
  
  // Feed data
  feedState: any;
  feedFilters: any;
  setFeedFilters: any;
  feedSearchDraft: string;
  setFeedSearchDraft: any;
  
  // Stream data
  streamFeed: any;
  
  // Swipe data
  swipeData: any;
  
  // Settings
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // Callbacks
  onInviteByUsername: (username: string, message?: string) => Promise<void>;
  onRespondRequest: (requestId: string, action: "accept" | "decline" | "cancel") => Promise<void>;
  onRemoveBookworm: (friendId: string) => Promise<void>;
  onSessionRespond: (sessionId: string, action: "accept" | "decline" | "left") => Promise<void>;
  onOpenFeedSession: (sessionId: string) => void;
  onResumeSession: (sessionId: string) => void;
}

export const ViewRouter: React.FC<ViewRouterProps> = ({
  focusedView,
  setFocusedView,
  profile,
  userId,
  prologueData,
  feedState,
  feedFilters,
  setFeedFilters,
  feedSearchDraft,
  setFeedSearchDraft,
  streamFeed,
  swipeData,
  settingsOpen,
  setSettingsOpen,
  onInviteByUsername,
  onRespondRequest,
  onRemoveBookworm,
  onSessionRespond,
  onOpenFeedSession,
  onResumeSession,
}) => {
  // Settings Panel (overlay)
  if (settingsOpen) {
    return (
      <AccountSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onProfileUpdate={(updatedProfile) => {
          // Handle profile update
          console.log('Profile updated:', updatedProfile);
        }}
        sessions={prologueData.sessions || []}
        timeline={prologueData.timeline || []}
        publicFeed={prologueData.publicFeed || []}
        bookworms={prologueData.bookworms || []}
        notifications={prologueData.notifications || []}
        mythacoin={prologueData.mythacoin || null}
        onInviteByUsername={onInviteByUsername}
        onGoToPublicFeed={() => setFocusedView("feed")}
        onGoToBookwormFeed={() => setFocusedView("feed")}
        onResumeSession={onResumeSession}
      />
    );
  }

  switch (focusedView) {
    case "prologue":
      return (
        <FuturisticDashboard
          profile={profile}
          feed={prologueData.feed || []}
          notifications={prologueData.notifications || []}
          characters={prologueData.characters || []}
          sessions={prologueData.sessions || []}
          creators={prologueData.bookworms || []}
          incomingRequests={prologueData.incomingRequests || []}
          outgoingRequests={prologueData.outgoingRequests || []}
          connectionStats={prologueData.connectionStats}
          loading={prologueData.loading}
          refresh={prologueData.refresh}
          worldId={prologueData.worldId || "default"}
          mythacoinSummary={prologueData.mythacoin}
          publicFeed={prologueData.publicFeed}
          stories={prologueData.stories || []}
          onOpenFeed={() => setFocusedView("feed")}
          onOpenStream={() => setFocusedView("stream")}
          onOpenCharacters={() => console.log("Open characters")}
          onOpenAngryLips={() => console.log("Open Angry Lips")}
          onEnterFeed={() => setFocusedView("feed")}
          onInviteByUsername={onInviteByUsername}
          onRespondRequest={onRespondRequest}
          onRemoveCreator={onRemoveBookworm}
          onSessionRespond={onSessionRespond}
          currentUserId={userId}
          onOpenSettings={() => setSettingsOpen(true)}
          streamPreview={streamFeed.events || []}
          onOpenAngryLipsTest={() => setFocusedView("angry-lips-test")}
          onOpenMasterTest={() => setFocusedView("master-test")}
          onOpenInviteFriends={() => setFocusedView("invite-friends")}
        />
      );

    case "feed":
      return (
        <FuturisticFeedView
          feedState={feedState}
          feedFilters={feedFilters}
          setFeedFilters={setFeedFilters}
          feedSearchDraft={feedSearchDraft}
          setFeedSearchDraft={setFeedSearchDraft}
          onBack={() => setFocusedView("prologue")}
          onOpenSession={onOpenFeedSession}
          currentUserId={userId}
        />
      );

    case "stream":
      return (
        <MythaStream
          events={streamFeed.events}
          loading={streamFeed.loading}
          error={streamFeed.error}
          hasMore={streamFeed.hasMore}
          onRefresh={streamFeed.refresh}
          onLoadMore={streamFeed.loadMore}
          onBack={() => setFocusedView("prologue")}
          onOpenFeed={() => setFocusedView("feed")}
          onOpenSession={onOpenFeedSession}
        />
      );

    case "swipe":
      return (
        <SwipeView
          {...swipeData}
          onBack={() => setFocusedView("prologue")}
          onOpenFeed={() => setFocusedView("feed")}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      );

    case "messages":
      return (
        <MessagingPanel
          currentUserId={userId}
          onClose={() => setFocusedView("prologue")}
        />
      );

    case "das-preferences":
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <h1 className="text-2xl font-bold text-white">DAS Preferences</h1>
              <button
                onClick={() => setFocusedView("prologue")}
                className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          <DasPreferencesPanel />
        </div>
      );

    case "das-voting":
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Vote on Brands</h1>
              <button
                onClick={() => setFocusedView("prologue")}
                className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          <DasVotingPanel />
        </div>
      );

    case "das-transparency":
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <h1 className="text-2xl font-bold text-white">DAS Transparency Dashboard</h1>
              <button
                onClick={() => setFocusedView("prologue")}
                className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          <DasTransparencyDashboard />
        </div>
      );

    case "angry-lips-test":
      return <AngryLipsTestSuite />;

    case "master-test":
      return <MasterTestSuite />;

    case "crash-test":
      return <CrashRecoveryTest />;

    case "invite-friends":
      return <InviteFriends />;

    default:
      // Default to prologue if unknown view
      return (
        <FuturisticDashboard
          profile={profile}
          feed={prologueData.feed}
          notifications={prologueData.notifications}
          characters={prologueData.characters}
          sessions={prologueData.sessions}
          bookworms={prologueData.bookworms}
          incomingRequests={prologueData.incomingRequests}
          outgoingRequests={prologueData.outgoingRequests}
          connectionStats={prologueData.connectionStats}
          loading={prologueData.loading}
          refresh={prologueData.refresh}
          worldId={prologueData.worldId}
          mythacoinSummary={prologueData.mythacoin}
          publicFeed={prologueData.publicFeed}
          onOpenFeed={() => setFocusedView("feed")}
          onOpenStream={() => setFocusedView("stream")}
          onInviteByUsername={onInviteByUsername}
          onRespondRequest={onRespondRequest}
          onRemoveCreator={onRemoveBookworm}
          onSessionRespond={onSessionRespond}
          currentUserId={userId}
          onOpenSettings={() => setSettingsOpen(true)}
          streamPreview={streamFeed.events}
          onOpenAngryLipsTest={() => setFocusedView("angry-lips-test")}
          onOpenMasterTest={() => setFocusedView("master-test")}
          onOpenInviteFriends={() => setFocusedView("invite-friends")}
        />
      );
  }
};

