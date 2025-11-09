import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import type { UserProfile } from "../../lib/profile";
import type { StoryHighlight } from "../../data/sampleStories";
import type { TimelineNode } from "../../data/sampleTimelines";
import type {
  AngryLipsSessionSummary,
  CharacterSummary,
  StoryNotification,
} from "../../lib/prologueApi";
import type {
  BookwormConnection,
  ConnectionRequest,
  ConnectionStats,
} from "../../lib/social";
import type { MythacoinSummary } from "../../lib/mythacoin";
import { PLATFORM_NAMES, formatCurrencyWithSymbol } from "../../config/naming";
import type { StreamEvent } from "../../lib/types";
import { createAngryLipsSession } from "../../lib/angryLipsApi";

interface PrologueDashboardProps {
  profile: UserProfile;
  feed: TimelineNode[];
  notifications: StoryNotification[];
  characters: CharacterSummary[];
  sessions: AngryLipsSessionSummary[];
  bookworms: BookwormConnection[];
  incomingRequests: ConnectionRequest[];
  outgoingRequests: ConnectionRequest[];
  connectionStats: ConnectionStats | null;
  stories: StoryHighlight[];
  loading: boolean;
  worldId: string;
  onRefresh: () => void;
  onEnterFeed: () => void;
  onOpenCharacters: () => void;
  onOpenAngryLips: () => void;
  onOpenStream: () => void;
  onInviteByUsername: (username: string, message?: string) => Promise<void>;
  onRespondRequest: (requestId: string, action: "accept" | "decline" | "cancel") => Promise<void>;
  onRemoveBookworm: (friendId: string) => Promise<void>;
  onSessionRespond: (sessionId: string, action: "accept" | "decline" | "left") => Promise<void>;
  currentUserId: string;
  mythacoinSummary: MythacoinSummary | null;
  onOpenSettings: () => void;
  streamPreview: StreamEvent[];
  onOpenAngryLipsTest?: () => void;
}

export function PrologueDashboard({
  profile,
  feed,
  notifications,
  characters,
  sessions,
  bookworms,
  incomingRequests,
  outgoingRequests,
  connectionStats,
  stories,
  loading,
  worldId,
  onRefresh,
  onEnterFeed,
  onOpenCharacters,
  onOpenAngryLips,
  onOpenStream,
  onInviteByUsername,
  onRespondRequest,
  onRemoveBookworm,
  onSessionRespond,
  currentUserId,
  mythacoinSummary,
  onOpenSettings,
  streamPreview,
  onOpenAngryLipsTest,
}: PrologueDashboardProps) {
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionLength, setSessionLength] = useState<"quick" | "classic" | "epic">("quick");
  const [sessionWindow, setSessionWindow] = useState(3);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);

  const feedItems = feed.slice(0, 3);
  const characterHighlights = characters.slice(0, 3);
  const sessionHighlights = sessions.slice(0, 3);
  const notificationItems = notifications.slice(0, 5);
  const suggestionStories = useMemo(() => stories.slice(0, 3), [stories]);
  const availableBookworms = useMemo(() => bookworms, [bookworms]);
  const streamHighlights = useMemo(() => streamPreview.slice(0, 3), [streamPreview]);

  const bookwormCount = connectionStats?.bookwormCount ?? 0;
  const inboundCount = connectionStats?.incomingPending ?? 0;
  const outboundCount = connectionStats?.outgoingPending ?? 0;
  const mythacoinBalance =
    mythacoinSummary?.balance ??
    (typeof profile.mytha_coins === "number" ? profile.mytha_coins : Number(profile.mytha_coins ?? 0));

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviteBusy(true);
    setInviteStatus(null);
    try {
      await onInviteByUsername(inviteUsername.trim(), inviteMessage.trim() || undefined);
      setInviteStatus(`Invite sent to ${inviteUsername.trim()}.`);
      setInviteUsername("");
      setInviteMessage("");
      onRefresh();
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "Failed to send invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  const toggleParticipantSelection = (friendId: string) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const handleCreateSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSessionBusy(true);
    setSessionError(null);
    setSessionSuccess(null);
    try {
      const participantIds = Array.from(selectedParticipants);
      const response = await createAngryLipsSession({
        hostId: profile.user_id,
        participantIds,
        templateLength: sessionLength,
        responseWindowMinutes: sessionWindow,
        title: sessionTitle.trim() || undefined,
      });
      setSessionSuccess(`Session "${response.session.title ?? "Untitled"}" created.`);
      setShowCreateSession(false);
      setSelectedParticipants(new Set());
      setSessionTitle("");
      setSessionLength("quick");
      setSessionWindow(3);
      onRefresh();
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Failed to create session.");
    } finally {
      setSessionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b152c] to-[#010910]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 text-white">
        <header className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-black/30 p-8 shadow-lg shadow-aurora/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <AvatarBadge profile={profile} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-50">{profile.display_name ?? profile.username}</h1>
                <Pill variant="aurora" className="text-[0.65rem] normal-case text-aurora">
                  @{profile.username}
                </Pill>
              </div>
              {profile.bio ? <p className="mt-1 text-sm text-slate-300">{profile.bio}</p> : null}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span>Fellow BookWorms: {bookwormCount}</span>
                <span>Incoming requests: {inboundCount}</span>
                <span>Outgoing requests: {outboundCount}</span>
                <span>{PLATFORM_NAMES.currency} balance: {formatCurrencyWithSymbol(mythacoinBalance)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Pill variant="subtle" className="text-[0.65rem] normal-case text-slate-300">
              Primary world: {worldId}
            </Pill>
            <Button type="button" size="sm" variant="secondary" onClick={onEnterFeed}>
              Open Story Feed
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onOpenStream}>
              Open MythaStream
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => window.location.hash = 'messages'}>
              💬 Messages
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => window.location.hash = 'das-voting'}>
              🗳️ Democratic Ads
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onOpenSettings}>
              Account Settings
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <DashboardCard
              title="Your Story Feed"
              subtitle="Latest highlights from teams and universes you follow."
              actionLabel="Enter feed"
              onAction={onEnterFeed}
            >
              <LoadingState loading={loading} empty={feedItems.length === 0} emptyText="No recent story activity yet.">
                <div className="space-y-4">
                  {feedItems.map((node) => (
                    <FeedSnippet key={node.id} node={node} />
                  ))}
                </div>
              </LoadingState>
            </DashboardCard>

            <DashboardCard
              title="MythaStream"
              subtitle="Live publishes and signals from across the network."
              actionLabel="Open stream"
              onAction={onOpenStream}
            >
              <LoadingState loading={loading} empty={streamHighlights.length === 0} emptyText="No public activity yet.">
                <ul className="space-y-3 text-sm text-slate-200">
                  {streamHighlights.map((event) => (
                    <li key={event.id} className="rounded-2xl border border-slate-800/60 bg-black/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold capitalize">{event.eventType.replace(/_/g, " ")}</span>
                        <span className="text-[11px] uppercase tracking-wide text-slate-500">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{renderStreamHeadline(event)}</p>
                    </li>
                  ))}
                </ul>
              </LoadingState>
            </DashboardCard>

            <DashboardCard
              title="Characters on your desk"
              subtitle="Evolving personas queued for polish."
              actionLabel="Manage characters"
              onAction={onOpenCharacters}
            >
              <LoadingState loading={loading} empty={characterHighlights.length === 0} emptyText="No characters yet. Build your first roster entry.">
                <div className="space-y-3">
                  {characterHighlights.map((character) => (
                    <CharacterSnippet key={character.id} character={character} />
                  ))}
                </div>
              </LoadingState>
            </DashboardCard>

            <DashboardCard
              title="Angry Lips Sessions"
              subtitle="Active and archived mad-lib battles."
              actionLabel="Open Angry Lips"
              onAction={onOpenAngryLips}
              secondaryActionLabel={profile.username === 'MythaTron' && onOpenAngryLipsTest ? "Test Suite" : undefined}
              onSecondaryAction={profile.username === 'MythaTron' ? onOpenAngryLipsTest : undefined}
            >
              <LoadingState
                loading={loading}
                empty={sessionHighlights.length === 0}
                emptyText="No sessions yet. Host your first Angry Lips round."
              >
                <div className="space-y-3">
                  {sessionHighlights.map((session) => (
                    <SessionSnippet
                      key={session.id}
                      session={session}
                      currentUserId={currentUserId}
                      onRespond={onSessionRespond}
                    />
                  ))}
                </div>
              </LoadingState>
              <div className="mt-5 rounded-2xl border border-slate-800/70 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Host a private session</h3>
                    <p className="text-xs text-slate-400">
                      Select BookWorms to invite. They will see the session in their Prologue once they accept.
                    </p>
                    {!showCreateSession && sessionSuccess ? (
                      <p className="mt-2 text-xs text-aurora-200">{sessionSuccess}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={showCreateSession ? "ghost" : "primary"}
                    onClick={() => {
                      setShowCreateSession((prev) => !prev);
                      setSessionError(null);
                      setSessionSuccess(null);
                    }}
                  >
                    {showCreateSession ? "Cancel" : "Host session"}
                  </Button>
                </div>
                {showCreateSession ? (
                  <form className="mt-4 space-y-4" onSubmit={handleCreateSession}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Title
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(event) => setSessionTitle(event.target.value)}
                          placeholder="Aurora heist showdown"
                          className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/50 px-4 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                        />
                      </label>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Response window (minutes)
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={sessionWindow}
                          onChange={(event) => setSessionWindow(Number(event.target.value))}
                          className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/50 px-4 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["quick", "classic", "epic"] as const).map((length) => (
                        <Button
                          key={length}
                          type="button"
                          size="sm"
                          variant={sessionLength === length ? "primary" : "ghost"}
                          onClick={() => setSessionLength(length)}
                        >
                          {length.charAt(0).toUpperCase() + length.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Invite BookWorms</div>
                      {availableBookworms.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">
                          You don’t have any BookWorm connections yet. Invite friends from the network card above.
                        </p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {availableBookworms.map((connection) => {
                            const isSelected = selectedParticipants.has(connection.friendId);
                            const label =
                              connection.friend.displayName ?? connection.friend.username ?? "Storyteller";
                            return (
                              <label
                                key={connection.friendId}
                                className={`flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-black/30 px-4 py-2 text-sm transition ${
                                  isSelected ? "border-aurora/60 bg-aurora/10" : "hover:border-aurora/40 hover:bg-aurora/5"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-700 bg-black/70 text-aurora focus:ring-aurora/60"
                                  checked={isSelected}
                                  onChange={() => toggleParticipantSelection(connection.friendId)}
                                />
                                <div>
                                  <div className="font-semibold text-white">{label}</div>
                                  {connection.friend.username ? (
                                    <div className="text-xs text-slate-400">@{connection.friend.username}</div>
                                  ) : null}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {sessionError ? <p className="text-xs text-rose-400">{sessionError}</p> : null}
                    {sessionSuccess ? <p className="text-xs text-aurora-200">{sessionSuccess}</p> : null}
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowCreateSession(false);
                          setSessionError(null);
                          setSessionSuccess(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" variant="primary" disabled={sessionBusy}>
                        {sessionBusy ? "Creating…" : "Create session"}
                      </Button>
                    </div>
                  </form>
                ) : null}
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard title="Fellow BookWorms" subtitle="Invite friends and manage your network.">
              <LoadingState loading={loading} empty={bookworms.length === 0} emptyText="No BookWorms yet. Send an invite below.">
                <ul className="space-y-3">
                  {bookworms.map((connection) => (
                    <BookwormItem
                      key={connection.friendId}
                      connection={connection}
                      onRemove={async () => {
                        await onRemoveBookworm(connection.friendId);
                        onRefresh();
                      }}
                    />
                  ))}
                </ul>
              </LoadingState>

              <div className="mt-5 rounded-2xl border border-slate-800/70 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white">Invite by username</h3>
                <p className="mt-1 text-xs text-slate-400">Enter their MythaTron username to send a BookWorm request.</p>
                <form className="mt-3 space-y-3" onSubmit={handleInviteSubmit}>
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(event) => setInviteUsername(event.target.value)}
                    placeholder="@storycrafter"
                    className="w-full rounded-2xl border border-slate-800 bg-black/50 px-4 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                  />
                  <textarea
                    value={inviteMessage}
                    onChange={(event) => setInviteMessage(event.target.value)}
                    rows={2}
                    placeholder="Optional message"
                    className="w-full rounded-2xl border border-slate-800 bg-black/50 px-4 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                  />
                  <Button type="submit" variant="primary" disabled={inviteBusy}>
                    {inviteBusy ? "Sending..." : "Send invite"}
                  </Button>
                  {inviteStatus ? <p className="text-xs text-slate-400">{inviteStatus}</p> : null}
                </form>
              </div>
            </DashboardCard>

            <DashboardCard title="Pending invitations" subtitle="Manage incoming and outgoing BookWorm requests.">
              <LoadingState
                loading={loading}
                empty={incomingRequests.length === 0 && outgoingRequests.length === 0}
                emptyText="No pending requests."
              >
                <RequestSection
                  label="Incoming requests"
                  emptyText="No incoming invites."
                  requests={incomingRequests}
                  actions={[
                    { label: "Accept", action: "accept" },
                    { label: "Decline", action: "decline" },
                  ]}
                  onRespond={onRespondRequest}
                  currentUserId={profile.user_id}
                />
                <div className="my-4 h-px bg-slate-800/60" />
                <RequestSection
                  label="Outgoing requests"
                  emptyText="No outgoing invites."
                  requests={outgoingRequests}
                  actions={[{ label: "Cancel", action: "cancel" }]}
                  onRespond={onRespondRequest}
                  currentUserId={profile.user_id}
                />
              </LoadingState>
            </DashboardCard>

            <DashboardCard title="Stories on your radar" subtitle="Worlds you’re tracking for canon updates.">
              <div className="space-y-3">
                {suggestionStories.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    className="w-full rounded-2xl border border-slate-800/70 bg-black/30 px-4 py-3 text-left transition hover:border-aurora/40 hover:bg-aurora/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora/60"
                  >
                    <div className="text-sm font-semibold text-white">{story.title}</div>
                    <div className="text-xs text-slate-400">World: {story.world}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-slate-500">
                      {story.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-700 px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title={PLATFORM_NAMES.currency} subtitle="Track creative contributions and unlock special access.">
              <div className="rounded-2xl border border-aurora/30 bg-aurora/10 p-4 text-sm text-white shadow-inner">
                <div className="text-xs uppercase tracking-wide text-aurora/70">Balance</div>
                <div className="mt-1 text-2xl font-semibold text-white">{formatCurrencyWithSymbol(mythacoinBalance)}</div>
                <p className="mt-4 text-xs text-aurora-100">
                  Boost your balance by publishing canon chapters, hosting Angry Lips sessions, or curating BookWorm circles. Rewards coming
                  soon.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Recent rewards</div>
                {mythacoinSummary?.transactions?.length ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    {mythacoinSummary.transactions.slice(0, 5).map((txn) => (
                      <li
                        key={txn.id}
                        className="rounded-2xl border border-slate-800/70 bg-black/25 px-3 py-2"
                      >
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                          <span>{txn.transactionType.replace(/_/g, " ")}</span>
                          <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">
                            {txn.amount >= 0 ? "+" : ""}
                            {txn.amount.toFixed(2)} MC
                          </span>
                          {txn.description ? (
                            <span className="text-xs text-slate-400">{txn.description}</span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No transactions yet. Earn coins by hosting and participating.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Recent activity"
              subtitle="Timeline events, critiques, and automation logs."
              actionLabel="Refresh"
              onAction={onRefresh}
            >
              <LoadingState loading={loading} empty={notificationItems.length === 0} emptyText="No notifications yet.">
                <ul className="space-y-3 text-sm text-slate-300">
                  {notificationItems.map((notification) => (
                    <li key={notification.id} className="rounded-2xl border border-slate-800/70 bg-black/30 p-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                        <span>{notification.eventType.replace(/_/g, " ")}</span>
                        <span>{notification.createdAt}</span>
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-[0.65rem] text-slate-300">
                        {JSON.stringify(notification.payload, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              </LoadingState>
            </DashboardCard>
          </div>
        </section>
      </div>
    </div>
  );
}

function renderStreamHeadline(event: StreamEvent): string {
  const payload = event.payload ?? {};

  if (event.eventType === "angry_lips_published") {
    const title = (payload.title as string) ?? "Untitled session";
    const hostDisplay =
      (payload.hostDisplayName as string) ??
      (payload.hostUsername as string) ??
      (payload.hostId as string | null)?.slice(0, 6) ??
      "Host";
    return `${hostDisplay} published “${title}”`;
  }

  if (event.eventType === "chapter_added") {
    const chapterTitle = (payload.title as string) ?? "New chapter";
    const branch = payload.branchTitle as string | undefined;
    return branch ? `${chapterTitle} landed on ${branch}` : chapterTitle;
  }

  if (event.eventType === "story_saved") {
    const branch = payload.branchTitle as string | undefined;
    return branch ? `Story update saved to ${branch}` : "Story saved";
  }

  if (event.eventType === "comment_added") {
    const branch = payload.branchTitle as string | undefined;
    return branch ? `New comment on ${branch}` : "New story comment";
  }

  if (event.eventType === "connection_accepted") {
    const requester =
      (payload.requesterDisplayName as string) ??
      (payload.requesterUsername as string) ??
      "A BookWorm";
    const target =
      (payload.targetDisplayName as string) ??
      (payload.targetUsername as string) ??
      "another BookWorm";
    return `${requester} connected with ${target}`;
  }

  return "New activity";
}

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  actionLabel, 
  onAction, 
  secondaryActionLabel, 
  onSecondaryAction 
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-black/25 p-6 shadow-lg shadow-black/20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="flex gap-2">
          {secondaryActionLabel && onSecondaryAction ? (
            <Button type="button" size="sm" variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
          {actionLabel && onAction ? (
            <Button type="button" size="sm" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

interface FeedSnippetProps {
  node: TimelineNode;
}

function FeedSnippet({ node }: FeedSnippetProps) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-black/30 p-4 shadow-inner shadow-black/10">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-200">{node.author}</span>
        <span>{node.createdAt}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{node.title}</div>
      {node.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-slate-500">
          {node.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface CharacterSnippetProps {
  character: CharacterSummary;
}

function CharacterSnippet({ character }: CharacterSnippetProps) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-black/30 p-4">
      <div className="text-sm font-semibold text-white">{character.displayName}</div>
      {character.tagline ? <p className="mt-1 text-xs text-aurora-200">{character.tagline}</p> : null}
      {character.summary ? <p className="mt-2 text-sm text-slate-300 line-clamp-2">{character.summary}</p> : null}
      {character.tags?.length ? (
        <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-slate-500">
          {character.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SessionSnippetProps {
  session: AngryLipsSessionSummary;
  currentUserId: string;
  onRespond: (sessionId: string, action: "accept" | "decline" | "left") => Promise<void>;
}

function SessionSnippet({ session, currentUserId, onRespond }: SessionSnippetProps) {
  const [busy, setBusy] = useState(false);

  const acceptedCount = useMemo(
    () => session.participants.filter((participant) => participant.status === "accepted").length,
    [session.participants]
  );
  const totalInvited = session.participants.length;

  const invitedHandles = session.participants
    .filter((participant) => participant.status === "invited")
    .map((participant) => participant.handle)
    .filter(Boolean)
    .slice(0, 3);
  const currentParticipant = useMemo(
    () => session.participants.find((participant) => participant.userId === currentUserId) ?? null,
    [session.participants, currentUserId]
  );

  const handleRespond = async (action: "accept" | "decline" | "left") => {
    setBusy(true);
    try {
      await onRespond(session.id, action);
    } catch (error) {
      console.error("Failed to update session invitation", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-black/30 p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
        <span>{session.status}</span>
        <span>{session.templateLength}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{session.title ?? "Untitled Session"}</div>
      <div className="mt-1 text-xs text-slate-400">
        {session.genre ? `Genre: ${session.genre}` : "Genre TBD"} • {acceptedCount}/{totalInvited} participants ready
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Response window: {session.responseWindowMinutes} minute{session.responseWindowMinutes === 1 ? "" : "s"}
      </p>
      {invitedHandles.length ? (
        <p className="mt-2 text-[0.65rem] uppercase tracking-wide text-aurora/70">
          Pending: {invitedHandles.join(", ")}
          {totalInvited - acceptedCount - invitedHandles.length > 0 ? "…" : ""}
        </p>
      ) : null}
      {currentParticipant ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {currentParticipant.status === "invited" ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleRespond("accept")}
                disabled={busy}
              >
                {busy ? "…" : "Accept"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRespond("decline")}
                disabled={busy}
              >
                Decline
              </Button>
            </>
          ) : currentParticipant.status === "accepted" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleRespond("left")}
              disabled={busy}
            >
              Leave session
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface AvatarBadgeProps {
  profile: UserProfile;
}

function AvatarBadge({ profile }: AvatarBadgeProps) {
  const avatarKey = profile.avatar_key ?? "aurora_wave";
  const gradient = avatarGradient(avatarKey);

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.display_name ?? profile.username}
        className="h-16 w-16 rounded-full border border-white/20 object-cover shadow-lg shadow-black/30"
      />
    );
  }

  return (
    <div
      className={`h-16 w-16 rounded-full border border-white/10 bg-gradient-to-br ${gradient} shadow-lg shadow-black/30`}
      aria-hidden
    />
  );
}

function avatarGradient(key: string): string {
  switch (key) {
    case "nebula_glow":
      return "from-[#f97316] via-[#fb7185] to-[#f472b6]";
    case "midnight_spark":
      return "from-[#0ea5e9] via-[#14b8a6] to-[#22d3ee]";
    case "veridian_cascade":
      return "from-[#22c55e] via-[#10b981] to-[#2dd4bf]";
    case "solar_flare":
      return "from-[#facc15] via-[#fb923c] to-[#f97316]";
    case "violet_dream":
      return "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]";
    case "aurora_wave":
    default:
      return "from-[#38bdf8] via-[#818cf8] to-[#c084fc]";
  }
}

interface LoadingStateProps {
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}

function LoadingState({ loading, empty, emptyText, children }: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-800/70 bg-black/30 p-6 text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-black/20 p-5 text-sm text-slate-400">
        {emptyText}
      </div>
    );
  }

  return <>{children}</>;
}

interface BookwormItemProps {
  connection: BookwormConnection;
  onRemove: () => Promise<void>;
}

function BookwormItem({ connection, onRemove }: BookwormItemProps) {
  const [busy, setBusy] = useState(false);
  const friend = connection.friend;
  const label = friend.displayName ?? friend.username ?? "Storyteller";

  const handleRemove = async () => {
    setBusy(true);
    try {
      await onRemove();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-black/30 p-3">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {friend.username ? <div className="text-xs text-slate-400">@{friend.username}</div> : null}
        <div className="text-[0.65rem] uppercase tracking-wide text-slate-500">
          Connected {new Date(connection.createdAt).toLocaleDateString()}
        </div>
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={handleRemove} disabled={busy}>
        {busy ? "Removing..." : "Remove"}
      </Button>
    </li>
  );
}

interface RequestSectionProps {
  label: string;
  emptyText: string;
  requests: ConnectionRequest[];
  actions: Array<{ label: string; action: "accept" | "decline" | "cancel" }>;
  onRespond: (requestId: string, action: "accept" | "decline" | "cancel") => Promise<void>;
  currentUserId: string;
}

function RequestSection({ label, emptyText, requests, actions, onRespond, currentUserId }: RequestSectionProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      {requests.length === 0 ? (
        <div className="mt-2 rounded-2xl border border-slate-800/70 bg-black/20 p-3 text-xs text-slate-400">{emptyText}</div>
      ) : (
        <ul className="mt-3 space-y-3">
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              actions={actions}
              onRespond={onRespond}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface RequestItemProps {
  request: ConnectionRequest;
  actions: Array<{ label: string; action: "accept" | "decline" | "cancel" }>;
  onRespond: (requestId: string, action: "accept" | "decline" | "cancel") => Promise<void>;
  currentUserId: string;
}

function RequestItem({ request, actions, onRespond, currentUserId }: RequestItemProps) {
  const [busy, setBusy] = useState(false);
  const other = request.requesterId === currentUserId ? request.target : request.requester;
  const label = other.displayName ?? other.username ?? "Storyteller";

  const handleAction = async (action: "accept" | "decline" | "cancel") => {
    setBusy(true);
    try {
      await onRespond(request.id, action);
    } catch (error) {
      console.error("Failed to update BookWorm request", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-slate-800/70 bg-black/25 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          {other.username ? <div className="text-xs text-slate-400">@{other.username}</div> : null}
          {request.message ? <p className="mt-1 text-xs text-slate-300">"{request.message}"</p> : null}
          <div className="mt-1 text-[0.65rem] uppercase tracking-wide text-slate-500">
            Sent {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.action}
              type="button"
              size="sm"
              variant={action.action === "accept" ? "primary" : "ghost"}
              onClick={() => handleAction(action.action)}
              disabled={busy}
            >
              {busy ? "..." : action.label}
            </Button>
          ))}
        </div>
      </div>
    </li>
  );
}



