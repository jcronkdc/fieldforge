import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "./supabaseClient";

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_key: string | null;
  avatar_url: string | null;
  bio: string | null;
  mytha_coins: number;
  allow_invites: boolean;
  show_profile: boolean;
  last_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  // Check if in demo mode
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_URL === "https://placeholder.supabase.co";
  
  if (isDemoMode) {
    // Return demo profile from localStorage
    const storedProfile = localStorage.getItem('mythatron_profile');
    if (storedProfile) {
      try {
        return JSON.parse(storedProfile);
      } catch (e) {
        console.error('Error parsing stored profile:', e);
      }
    }
    
    // Create default demo profile
    const demoEmail = localStorage.getItem('mythatron_user_email') || 'user@demo.com';
    const username = localStorage.getItem('mythatron_username') || demoEmail.split('@')[0];
    
    const demoProfile: UserProfile = {
      user_id: userId,
      username: username,
      display_name: username,
      avatar_key: null,
      avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userId}`,
      bio: 'Welcome to MythaTron!',
      mytha_coins: 1000,
      allow_invites: true,
      show_profile: true,
      last_session_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store the demo profile
    localStorage.setItem('mythatron_profile', JSON.stringify(demoProfile));
    return demoProfile;
  }

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserProfile>();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data ?? null;
}

export interface ProfileInput {
  userId: string;
  username: string;
  displayName?: string;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  bio?: string;
  allowInvites?: boolean;
  showProfile?: boolean;
  lastSessionId?: string | null;
}

export async function upsertProfile(input: ProfileInput): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> {
  const { userId, username, displayName, avatarKey, avatarUrl, bio, allowInvites, showProfile, lastSessionId } = input;

  // Check if in demo mode
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_URL === "https://placeholder.supabase.co";
  
  if (isDemoMode) {
    // Create and store demo profile
    const demoProfile: UserProfile = {
      user_id: userId,
      username,
      display_name: displayName ?? username,
      avatar_key: avatarKey ?? null,
      avatar_url: avatarUrl ?? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userId}`,
      bio: bio ?? 'Welcome to MythaTron!',
      mytha_coins: 1000,
      allow_invites: allowInvites ?? true,
      show_profile: showProfile ?? true,
      last_session_id: lastSessionId ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('mythatron_profile', JSON.stringify(demoProfile));
    localStorage.setItem('mythatron_username', username);
    
    return { profile: demoProfile, error: null };
  }

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        username,
        display_name: displayName ?? null,
        avatar_key: avatarKey ?? null,
        avatar_url: avatarUrl ?? null,
        bio: bio ?? null,
        allow_invites: allowInvites ?? undefined,
        show_profile: showProfile ?? undefined,
        last_session_id: lastSessionId ?? undefined,
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single<UserProfile>();

  if (error) {
    return { profile: null, error };
  }

  return { profile: data, error: null };
}

export async function uploadAvatarImage(userId: string, file: File): Promise<{ avatarKey: string; avatarUrl: string }> {
  if (!file || !userId) {
    throw new Error("Missing avatar file or user");
  }

  const bucket = "avatars";
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/png",
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  const avatarUrl = publicUrlData?.publicUrl;

  if (!avatarUrl) {
    throw new Error("Failed to resolve public avatar URL");
  }

  return { avatarKey: path, avatarUrl };
}


