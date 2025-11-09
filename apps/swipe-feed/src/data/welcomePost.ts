/**
 * Welcome Post - First post from MythaTron founder
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

export interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
    isFounder?: boolean;
    isVerified?: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  }[];
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isPinned?: boolean;
  visibility: 'public' | 'creators' | 'private';
}

export const FOUNDER_WELCOME_POST: Post = {
  id: 'founder-welcome-001',
  author: {
    username: 'MythaTron',
    displayName: 'Justin Cronk',
    isFounder: true,
    isVerified: true,
  },
  content: `🚀 Welcome to MythaTron, Creators! 🚀

This is more than just a platform - it's the beginning of a creative revolution where YOUR imagination shapes the future.

Here's what makes us different:

✨ **You Own Your Stories** - Every tale you create is yours. Branch them, remix them, evolve them with our community.

🎭 **Angry Lips** - Our revolutionary collaborative storytelling system where AI and humans create magic together. 

💰 **Sparks Economy** - Earn real rewards for your creativity. No ads unless YOU vote for them. If you do, creators get 40% of revenue!

🔗 **Creator Network** - Connect with fellow storytellers, artists, and dreamers. Build worlds together.

🗳️ **Democratic Platform** - YOU decide how MythaTron evolves. Your voice matters here.

We're limiting our beta to just 100 creators to ensure everyone gets the attention and support they deserve. You're not just early - you're a founding member of something extraordinary.

Tips for new Creators:
• Start with Angry Lips to break the ice
• Invite friends to earn bonus Sparks (25 when they join, 50 when they create!)
• Explore different story branches - there's no "wrong" way to create
• The AI features are optional - use Sparks to enhance your creativity when you want

I built MythaTron because I believe stories have the power to change the world. And I believe the best stories come from collaboration, not isolation.

So welcome, Creator. Welcome to your new creative home.

Let's build something amazing together. 💜

- Justin Cronk
Founder, MythaTron

P.S. - Mobile apps coming Q2 2025! The revolution goes wherever you go. 📱

#Welcome #Creators #MythaTron #Beta #Storytelling #CreativeRevolution #FoundersNote`,
  tags: ['Welcome', 'Creators', 'MythaTron', 'Beta', 'Storytelling', 'CreativeRevolution', 'FoundersNote'],
  createdAt: new Date().toISOString(),
  likes: 42,
  comments: 7,
  shares: 12,
  isPinned: true,
  visibility: 'public',
};

// Function to get all public posts including welcome post
export function getPublicFeedPosts(): Post[] {
  // In production, this would fetch from database
  // For now, return the welcome post
  return [FOUNDER_WELCOME_POST];
}

// Function to check if user has seen welcome post
export function hasSeenWelcomePost(userId: string): boolean {
  const seenKey = `mythatron_seen_welcome_${userId}`;
  return localStorage.getItem(seenKey) === 'true';
}

// Function to mark welcome post as seen
export function markWelcomePostSeen(userId: string): void {
  const seenKey = `mythatron_seen_welcome_${userId}`;
  localStorage.setItem(seenKey, 'true');
}
