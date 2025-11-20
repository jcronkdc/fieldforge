import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { UserProfile } from "../../lib/profile";
import { upsertProfile } from "../../lib/profile";
import type { AngryLipsSessionSummary, StoryNotification, TimelineNode } from "../../lib/prologueApi";
import type { AngryLipsFeedEntryResponse } from "../../lib/types";
import type { BookwormConnection } from "../../lib/social";
import type { MythacoinSummary } from "../../lib/mythacoin";
import { PLATFORM_NAMES, formatCurrencyWithSymbol } from "../../config/naming";
import { AvatarUploader } from "./AvatarUploader";
import { Button } from "../ui/Button";
import { useAuthContext } from "../../context/AuthContext";
import { supabaseClient } from "../../lib/supabaseClient";

type SettingsTab = "profile" | "security" | "social" | "activity" | "economy" | "quick";

interface AccountSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  sessions: AngryLipsSessionSummary[];
  timeline: TimelineNode[];
  publicFeed: AngryLipsFeedEntryResponse[];
  bookworms: BookwormConnection[];
  notifications: StoryNotification[];
  mythacoin: MythacoinSummary | null;
  onInviteByUsername: (username: string, message?: string) => Promise<void>;
  onGoToPublicFeed: () => void;
  onGoToBookwormFeed: () => void;
  onResumeSession: (sessionId: string) => void;
}

const usernamePattern = /^[a-z0-9_\-.]{3,20}$/i;

export function AccountSettingsPanel({
  open,
  onClose,
  profile,
  onProfileUpdate,
  sessions,
  timeline,
  publicFeed,
  bookworms,
  notifications,
  mythacoin,
  onInviteByUsername,
  onGoToPublicFeed,
  onGoToBookwormFeed,
  onResumeSession,
}: AccountSettingsPanelProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [username, setUsername] = useState(profile.username ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarChoice, setAvatarChoice] = useState(profile.avatar_key ?? "");
  const [avatarUpload, setAvatarUpload] = useState<{ key: string | null; url: string | null }>({
    key: profile.avatar_url ? profile.avatar_key ?? null : null,
    url: profile.avatar_url ?? null,
  });
  const [allowInvites, setAllowInvites] = useState(profile.allow_invites ?? true);
  const [showProfile, setShowProfile] = useState(profile.show_profile ?? true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const lastSessionId = profile.last_session_id ?? sessions[0]?.id ?? null;

  useEffect(() => {
    if (!open) return;
    setActiveTab("profile");
    setUsername(profile.username ?? "");
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setAvatarChoice(profile.avatar_url ? "" : profile.avatar_key ?? "");
    setAvatarUpload({
      key: profile.avatar_url ? profile.avatar_key ?? null : null,
      url: profile.avatar_url ?? null,
    });
    setAllowInvites(profile.allow_invites ?? true);
    setShowProfile(profile.show_profile ?? true);
    setEmail(user?.email ?? "");
    setEmailStatus(null);
    setEmailError(null);
    setPasswordStatus(null);
    setPasswordError(null);
    setInviteStatus(null);
    setInviteError(null);
  }, [open, profile, user?.email]);

  const usernameHint = useMemo(() => {
    if (username.trim()) return username.trim().toLowerCase();
    if (displayName.trim()) {
      return displayName.trim().replace(/\s+/g, "-").toLowerCase();
    }
    return "storyteller";
  }, [username, displayName]);

  const handleProfileSave = async () => {
    if (!usernamePattern.test(username.trim())) {
      setProfileError("Usernames must be 3-20 characters using letters, numbers, dashes, or underscores.");
      return;
    }
    if (bio.length > 280) {
      setProfileError("Bio must be 280 characters or fewer.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    try {
      const { profile: updated, error } = await upsertProfile({
        userId: profile.user_id,
        username: username.trim().toLowerCase(),
        displayName: displayName.trim() || usernameHint,
        avatarKey: avatarUpload.url ? avatarUpload.key : avatarChoice || null,
        avatarUrl: avatarUpload.url ?? null,
        bio: bio.trim() || undefined,
        allowInvites,
        showProfile,
        lastSessionId,
      });
      if (error || !updated) {
        throw new Error(error?.message ?? "Failed to update profile");
      }
      onProfileUpdate(updated);
      setProfileError(null);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailSave = async () => {
    if (!email || !email.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError(null);
    setEmailStatus("Sending verification email…");
    const { error } = await supabaseClient.auth.updateUser({ email });
    if (error) {
      setEmailError(error.message ?? "Failed to update email");
      setEmailStatus(null);
      return;
    }
    setEmailStatus("Check your inbox to confirm the update.");
  };

  const handlePasswordSave = async () => {
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError(null);
    const { error } = await supabaseClient.auth.updateUser({ password: passwords.next });
    if (error) {
      setPasswordError(error.message ?? "Failed to update password");
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordStatus("Password updated successfully.");
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) {
      setInviteError("Enter a username to invite.");
      return;
    }
    setInviteError(null);
    setInviteStatus("Sending invite.");
    try {
      await onInviteByUsername(inviteUsername.trim(), inviteMessage.trim() || undefined);
      setInviteStatus("Invite sent.");
      setInviteUsername("");
      setInviteMessage("");
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Failed to send invite");
      setInviteStatus(null);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={usernameHint}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              maxLength={280}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
            />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={allowInvites}
                onChange={(event) => setAllowInvites(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-black/40 text-aurora focus:ring-aurora"
              />
              Allow Fellow BookWorm invites
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showProfile}
                onChange={(event) => setShowProfile(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-black/40 text-aurora focus:ring-aurora"
              />
              Show profile in public feed
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <AvatarUploader
            userId={profile.user_id}
            value={avatarUpload}
            onChange={(next) => {
              setAvatarUpload(next);
              if (next.url) {
                setAvatarChoice("");
              }
            }}
            label="Avatar"
          />
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Preset badges</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {AVATAR_PRESETS.map((preset) => {
                const isActive = avatarChoice === preset.key && !avatarUpload.url;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      setAvatarChoice(preset.key);
                      setAvatarUpload({ key: null, url: null });
                    }}
                    className={clsx(
                      "rounded-2xl border border-slate-800 bg-black/40 p-3 text-left transition",
                      isActive && "border-aurora/70 bg-aurora/10"
                    )}
                  >
                    <div
                      className={clsx(
                        "mb-2 h-10 w-10 rounded-full border border-white/10",
                        "bg-gradient-to-br",
                        preset.gradient
                      )}
                    />
                    <div className="text-sm font-semibold text-white">{preset.label}</div>
                    <div className="text-[0.65rem] uppercase tracking-wide text-slate-500">Badge ID: {preset.key}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {profileError ? <p className="text-sm text-rose-400">{profileError}</p> : null}
      <div className="flex justify-end">
        <Button type="button" variant="primary" onClick={handleProfileSave} disabled={savingProfile}>
          {savingProfile ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Contact email</h3>
        <p className="text-xs text-slate-400">Update where we send confirmations and collab invites. You’ll receive a verification email.</p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
        />
        <Button type="button" variant="secondary" onClick={handleEmailSave}>
          Update email
        </Button>
        {emailError ? <p className="text-xs text-rose-400">{emailError}</p> : null}
        {emailStatus ? <p className="text-xs text-aurora-200">{emailStatus}</p> : null}
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Change password</h3>
        <input
          type="password"
          placeholder="New password"
          value={passwords.next}
          onChange={(event) => setPasswords((prev) => ({ ...prev, next: event.target.value }))}
          className="w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={passwords.confirm}
          onChange={(event) => setPasswords((prev) => ({ ...prev, confirm: event.target.value }))}
          className="w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
        />
        <Button type="button" variant="secondary" onClick={handlePasswordSave}>
          Update password
        </Button>
        {passwordError ? <p className="text-xs text-rose-400">{passwordError}</p> : null}
        {passwordStatus ? <p className="text-xs text-aurora-200">{passwordStatus}</p> : null}
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Tip: enable MFA, OAuth, and device kill-switches in Phase 2.</p>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-white">Invite BookWorms</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[2fr,2fr,auto]">
          <input
            type="text"
            value={inviteUsername}
            onChange={(event) => setInviteUsername(event.target.value)}
            placeholder="Username"
            className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
          />
          <input
            type="text"
            value={inviteMessage}
            onChange={(event) => setInviteMessage(event.target.value)}
            placeholder="Message (optional)"
            className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
          />
          <Button type="button" variant="primary" onClick={handleInvite}>
            Send invite
          </Button>
        </div>
        {inviteError ? <p className="mt-2 text-xs text-rose-400">{inviteError}</p> : null}
        {inviteStatus ? <p className="mt-2 text-xs text-aurora-200">{inviteStatus}</p> : null}
      </div>
      <div className="rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-white">Fellow BookWorms</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {bookworms.length ? (
            bookworms.map((friend) => (
              <li
                key={friend.friendId}
                className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-black/30 px-3 py-2"
              >
                <span className="font-semibold">
                  {friend.friend.displayName ?? friend.friend.username ?? friend.friendId.slice(0, 6)}
                </span>
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Since {new Date(friend.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500">No connections yet.</li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-white">Angry Lips Sessions</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {sessions.length ? (
            sessions.map((session) => (
              <li key={session.id} className="rounded-2xl border border-slate-800/60 bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{session.title ?? `Session ${session.id.slice(0, 6)}`}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{session.status}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{session.participants?.length ?? 0} players</span>
                  {session.id === lastSessionId ? (
                    <Button type="button" variant="secondary" size="sm" onClick={() => onResumeSession(session.id)}>
                      Resume session
                    </Button>
                  ) : null}
                </div>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500">No sessions yet.</li>
          )}
        </ul>
      </div>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-white">Story branches</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {timeline.length ? (
              timeline.slice(0, 6).map((node) => (
                <li key={node.id} className="rounded-2xl border border-slate-800/60 bg-black/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{node.title}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{node.createdAt}</span>
                  </div>
                  <div className="text-xs text-slate-500">{node.tags?.join(", ")}</div>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500">No published branches yet.</li>
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {notifications.slice(0, 5).map((notification) => (
              <li key={notification.id} className="rounded-2xl border border-slate-800/60 bg-black/30 p-3">
                <div className="font-semibold text-slate-100">{notification.eventType}</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">{notification.createdAt}</div>
              </li>
            ))}
            {notifications.length === 0 ? <li className="text-slate-500">No activity yet.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderEconomyTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-aurora/30 bg-aurora/10 p-5 text-sm text-white shadow-inner">
        <div className="text-xs uppercase tracking-wide text-aurora-100">{PLATFORM_NAMES.currency} balance</div>
        <div className="mt-2 text-3xl font-semibold">{formatCurrencyWithSymbol(mythacoin?.balance ?? profile.mytha_coins ?? 0)}</div>
        <p className="mt-3 text-xs text-aurora-50">Earn coins by publishing canon moments, hosting Angry Lips sessions, and curating BookWorm circles.</p>
        <Button type="button" variant="primary" size="sm" className="mt-4" disabled>
          Purchase more (coming soon)
        </Button>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-black/40 p-5 text-xs text-slate-300">
        <div className="text-xs uppercase tracking-wide text-slate-500">Latest rewards</div>
        <ul className="mt-3 space-y-2">
          {mythacoin?.transactions?.length ? (
            mythacoin.transactions.slice(0, 6).map((transaction) => (
              <li key={transaction.id} className="rounded-2xl border border-slate-800/60 bg-black/30 p-3">
                <div className="flex items-center justify-between text-sm text-slate-100">
                  <span>{transaction.transactionType.replace(/_/g, " ")}</span>
                  <span className="font-semibold">{transaction.amount >= 0 ? "+" : ""}{transaction.amount.toFixed(2)} MC</span>
                </div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</div>
                {transaction.description ? <div className="text-[11px] text-slate-400">{transaction.description}</div> : null}
              </li>
            ))
          ) : (
            <li className="text-slate-500">No transactions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderQuickTab = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-white">Feeds</h3>
        <Button type="button" variant="primary" onClick={onGoToPublicFeed}>
          View public Angry Lips feed
        </Button>
        <Button type="button" variant="secondary" onClick={onGoToBookwormFeed}>
          Jump to BookWorm feed
        </Button>
        <div className="text-xs text-slate-400">Public feed currently highlights freshly published Angry Lips sessions from across MythaTron.</div>
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-white">Resume work</h3>
        <Button type="button" variant="secondary" disabled={!lastSessionId} onClick={() => lastSessionId && onResumeSession(lastSessionId)}>
          {lastSessionId ? "Return to last Angry Lips session" : "No session in progress"}
        </Button>
        <div className="rounded-2xl border border-slate-800/60 bg-black/30 p-3 text-xs text-slate-300">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Latest public entries</div>
          <ul className="mt-2 space-y-2">
            {publicFeed.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between">
                <span className="text-slate-200">{entry.title}</span>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">{entry.hostDisplayName ?? entry.hostUsername}</span>
              </li>
            ))}
            {publicFeed.length === 0 ? <li className="text-slate-500">No public sessions yet.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<SettingsTab, JSX.Element> = {
    profile: renderProfileTab(),
    security: renderSecurityTab(),
    social: renderSocialTab(),
    activity: renderActivityTab(),
    economy: renderEconomyTab(),
    quick: renderQuickTab(),
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur">
      <div className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-aurora/40 bg-[#050b18]/95 p-8 text-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-slate-800/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Account settings</h2>
            <p className="text-sm text-slate-300">Manage your storyteller identity, security preferences, and quick launch tools.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 p-0 text-lg"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </Button>
        </header>
        <div className="mt-6 flex h-[calc(100%-5rem)] gap-6 overflow-hidden">
          <nav className="w-48 shrink-0 space-y-2 text-sm text-slate-300">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full rounded-2xl border border-transparent px-4 py-2 text-left transition",
                  activeTab === tab.id
                    ? "border-aurora/60 bg-aurora/10 text-white"
                    : "hover:border-slate-800 hover:bg-black/40"
                )}
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">{tab.label}</div>
                <div className="text-sm text-slate-200">{tab.description}</div>
              </button>
            ))}
          </nav>
          <section className="flex-1 overflow-y-auto pr-2">
            {tabContent[activeTab]}
          </section>
        </div>
      </div>
    </div>
  );
}

const AVATAR_PRESETS = [
  { key: "aurora_wave", label: "Aurora Wave", gradient: "from-[#38bdf8] via-[#818cf8] to-[#c084fc]" },
  { key: "nebula_glow", label: "Nebula Glow", gradient: "from-[#f97316] via-[#fb7185] to-[#f472b6]" },
  { key: "midnight_spark", label: "Midnight Spark", gradient: "from-[#0ea5e9] via-[#14b8a6] to-[#22d3ee]" },
  { key: "veridian_cascade", label: "Veridian Cascade", gradient: "from-[#22c55e] via-[#10b981] to-[#2dd4bf]" },
  { key: "solar_flare", label: "Solar Flare", gradient: "from-[#facc15] via-[#fb923c] to-[#f97316]" },
  { key: "violet_dream", label: "Violet Dream", gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]" },
];

const SETTINGS_TABS: Array<{ id: SettingsTab; label: string; description: string }> = [
  { id: "profile", label: "Profile", description: "Identity, avatar, and bio" },
  { id: "security", label: "Security", description: "Contact and password" },
  { id: "social", label: "Social", description: "Invites and BookWorms" },
  { id: "activity", label: "Activity", description: "Stories and Angry Lips" },
  { id: "economy", label: PLATFORM_NAMES.currency, description: "Balance and rewards" },
  { id: "quick", label: "Quick launch", description: "Feeds and return links" },
];


