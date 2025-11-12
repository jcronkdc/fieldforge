import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import type { UserProfile } from "../../lib/profile";
import { upsertProfile } from "../../lib/profile";
import { AvatarUploader } from "./AvatarUploader";
import { ButtonLoader } from "../LoadingStates";

const AVATAR_CHOICES = [
  { key: "aurora_wave", label: "Aurora Wave", gradient: "from-[#38bdf8] via-[#818cf8] to-[#c084fc]" },
  { key: "nebula_glow", label: "Nebula Glow", gradient: "from-[#f97316] via-[#fb7185] to-[#f472b6]" },
  { key: "midnight_spark", label: "Midnight Spark", gradient: "from-[#0ea5e9] via-[#14b8a6] to-[#22d3ee]" },
  { key: "veridian_cascade", label: "Veridian Cascade", gradient: "from-[#22c55e] via-[#10b981] to-[#2dd4bf]" },
  { key: "solar_flare", label: "Solar Flare", gradient: "from-[#facc15] via-[#fb923c] to-[#f97316]" },
  { key: "violet_dream", label: "Violet Dream", gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]" },
];

interface ProfileSetupProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(() => {
    const email = user?.email;
    if (!email) return "";
    const atIndex = email.indexOf("@");
    return atIndex > 0 ? email.slice(0, atIndex) : email;
  });
  const [bio, setBio] = useState("");
  const [avatarKey, setAvatarKey] = useState<string>(AVATAR_CHOICES[0]?.key ?? "");
  const [avatarUpload, setAvatarUpload] = useState<{ key: string | null; url: string | null }>({ key: null, url: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameHint = useMemo(() => {
    return username.trim() ? username.trim().toLowerCase() : `${(displayName || "adventurer").replace(/\s+/g, "-").toLowerCase()}`;
  }, [username, displayName]);

  const validate = () => {
    if (!username.trim()) {
      setError("Pick a username to share your canon.");
      return false;
    }
    if (!/^[a-z0-9_\-\.]{3,20}$/i.test(username.trim())) {
      setError("Usernames should be 3-20 letters, numbers, dashes, or underscores.");
      return false;
    }
    if (bio.length > 280) {
      setError("Bio must be 280 characters or fewer.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setBusy(true);
    let finalAvatarKey = avatarKey;
    let finalAvatarUrl: string | undefined;

    try {
      if (avatarUpload.url) {
        // If a custom avatar URL is provided, use it directly
        finalAvatarUrl = avatarUpload.url;
      } else if (avatarUpload.key) {
        // If an avatar key is provided, upload it
        // This part of the logic needs to be updated to handle the new AvatarUploader state
        // For now, we'll assume avatarUpload.key is the key of the chosen badge
        // In a real scenario, you'd upload the image here if avatarUpload.url was null
        // For this edit, we'll just set the key and let the upsertProfile handle it
        finalAvatarKey = avatarUpload.key;
      }

      const { profile, error: upsertError } = await upsertProfile({
        userId: user.id,
        username: username.trim().toLowerCase(),
        displayName: displayName.trim() || usernameHint,
        avatarKey: finalAvatarKey,
        avatarUrl: finalAvatarUrl,
        bio: bio.trim() || undefined,
        allowInvites: true,
        showProfile: true,
      });

      if (upsertError || !profile) {
        throw new Error(upsertError?.message ?? "Failed to save profile");
      }

      onComplete(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#06132a] to-[#010710] px-6 py-12 text-white">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800/80 bg-black/40 shadow-2xl shadow-aurora/15 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-aurora/10 via-transparent to-purple-900/20 opacity-60" aria-hidden />
        <div className="relative grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-6 border-b border-slate-800/60 p-10 md:border-b-0 md:border-r">
            <Pill variant="info" className="w-fit text-sm normal-case text-slate-100">
              Identify your crew role
            </Pill>
            <h1 className="text-3xl font-semibold text-slate-50">Set your storyteller identity</h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Choose a username, avatar, and quick bio so fellow bookworms know who’s weaving new branches. You can update this any time from
              the Prologue dashboard.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock title="Username" body="Displays on timelines, character sheets, and Angry Lips turns." />
              <InfoBlock title="Avatar" body="Pick an aurora badge or upload your own image to highlight your vibe." />
              <InfoBlock title="Bio" body="Share a short teaser—genres, collab preferences, or story flexes." />
              <InfoBlock title="Network" body="Unlock Fellow BookWorms, invites, and follower feeds once your profile is live." />
            </div>
          </div>

          <form className="flex flex-col gap-6 p-10" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-200">
                Username
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={usernameHint}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">Lowercase, 3–20 characters. Visible across the whole MythaTron network.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">
                Display name
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nova Vance"
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                />
              </label>
              <AvatarUploader
                userId={user.id}
                value={avatarUpload}
                onChange={(next) => {
                  setAvatarUpload(next);
                  if (next.url) {
                    setAvatarKey("");
                  }
                }}
                label="Upload custom avatar"
                disabled={busy}
              />
            </div>

            <div>
              <div className="text-sm font-medium text-slate-200">Choose an avatar badge</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {AVATAR_CHOICES.map((choice) => {
                  const isActive = avatarKey === choice.key;
                  return (
                    <button
                      key={choice.key}
                      type="button"
                      onClick={() => setAvatarKey(choice.key)}
                      className={clsx(
                        "relative overflow-hidden rounded-2xl border border-slate-800 bg-black/40 p-3 text-left transition",
                        "hover:border-aurora/40 hover:bg-aurora/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora/60",
                        isActive && "border-aurora/70 bg-aurora/10"
                      )}
                    >
                      <div
                        className={clsx(
                          "mb-3 h-12 w-12 rounded-full border border-white/10 shadow-lg shadow-black/40",
                          "bg-gradient-to-br",
                          choice.gradient
                        )}
                      />
                      <div className="text-sm font-semibold text-white">{choice.label}</div>
                      <div className="text-[0.65rem] uppercase tracking-wide text-slate-500">Badge ID: {choice.key}</div>
                    </button>
                  );
                })}
              </div>
              {avatarUpload.url ? (
                <p className="mt-2 text-xs text-slate-500">Custom avatar is active. Choose a badge to switch back.</p>
              ) : null}
            </div>

            <label className="block text-sm font-medium text-slate-200">
              Short bio
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                maxLength={280}
                placeholder="Glitch poet, co-op strategist, and guardian of canon. Always hunting for new Mad Lib chaos."
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
              />
              <span className="mt-1 block text-xs text-slate-500">{280 - bio.length} characters left</span>
            </label>

            {error ? <p className="text-xs text-rose-400">{error}</p> : null}

            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? "Saving profile" : "Save profile and continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface InfoBlockProps {
  title: string;
  body: string;
}

function InfoBlock({ title, body }: InfoBlockProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-black/30 p-4 text-sm text-slate-300 shadow-lg shadow-black/10">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-1 text-xs text-slate-400">{body}</p>
    </div>
  );
}


