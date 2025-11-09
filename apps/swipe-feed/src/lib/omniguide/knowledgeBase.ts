/**
 * OMNIGUIDE KNOWLEDGE BASE - Comprehensive System Intelligence
 */

export interface KnowledgeEntry {
  topic: string;
  category: string;
  content: string;
  related: string[];
  actions?: string[];
}

export const OMNIGUIDE_KNOWLEDGE: KnowledgeEntry[] = [
  // PLATFORM OVERVIEW
  {
    topic: "MythaTron Platform",
    category: "overview",
    content: `MythaTron is a next-generation creative AI ecosystem that combines gaming, storytelling, music creation, and social interaction. Built with cutting-edge technology, it features:
    
    • Multiple AI-powered creative applications (AngryLips, StoryForge, SongForge, MythaQuest)
    • Universal Sparks currency system for all AI features
    • Real-time collaboration and social features
    • Advanced profitability intelligence ensuring 65%+ margins
    • Futuristic UI with cyan/blue/purple aesthetic
    • Cross-platform synchronization and cloud saves`,
    related: ["Sparks", "Applications", "Features"],
    actions: ["explore_apps", "view_dashboard", "check_sparks"]
  },

  // ANGRYLIPS
  {
    topic: "AngryLips",
    category: "games",
    content: `AngryLips is an AI-powered Mad Libs battle game where players compete to create the funniest stories. Features include:
    
    • 5 Game Modes: Versus (competitive), Chain (sequential), Team Remix (collaborative), Speed Fill (time attack), Blind Collab (mystery)
    • 8 Genres: Comedy, Horror, Sci-Fi, Romance, Action, Mystery, Fantasy, Noir
    • Dynamic AI story generation (25 Sparks for custom stories)
    • Real-time multiplayer sessions
    • Scoring based on speed and creativity
    • Earn Sparks rewards based on performance
    • Advanced modes with AI mood directors and voice synthesis`,
    related: ["Games", "Multiplayer", "AI Stories"],
    actions: ["play_angry_lips", "view_modes", "create_session"]
  },

  // STORYFORGE
  {
    topic: "StoryForge",
    category: "creative",
    content: `StoryForge is a collaborative AI-powered story creation platform that enables branching narratives and world-building. Key features:
    
    • AI-assisted story generation with GPT-4 integration
    • Branching narrative paths with version control
    • Character development with personality quirks and backstories
    • World-building tools with lore management
    • Real-time collaboration with multiple authors
    • Genre-specific templates and prompts
    • Export to multiple formats (PDF, EPUB, HTML)
    • Integration with SongForge for story soundtracks
    • Memory system for narrative consistency`,
    related: ["Writing", "Collaboration", "AI Generation"],
    actions: ["open_storyforge", "create_story", "browse_templates"]
  },

  // SONGFORGE
  {
    topic: "SongForge",
    category: "creative",
    content: `SongForge is an AI music creation studio that generates lyrics, melodies, and complete songs. Capabilities include:
    
    • Dual AI layers for lyrics and melody generation
    • Genre-specific composition (Pop, Rock, Jazz, Classical, Electronic, etc.)
    • Real-time collaboration for co-writing
    • MIDI export and audio rendering
    • Chord progression suggestions
    • Rhyme scheme analysis
    • Voice synthesis for demos
    • Integration with StoryForge for narrative soundtracks
    • Remix and variation generation
    • Professional mixing suggestions`,
    related: ["Music", "AI Composition", "Collaboration"],
    actions: ["open_songforge", "create_song", "browse_genres"]
  },

  // MYTHAQUEST
  {
    topic: "MythaQuest",
    category: "games",
    content: `MythaQuest is an AI-driven RPG universe with procedural world generation and dynamic storytelling. Features:
    
    • World-Forge Engine: Procedural terrain, lore, factions, economy
    • Character-Forge Core: AI-assisted character creation with hybrid stats
    • Genre Matrix: Play across fantasy, sci-fi, horror, and more
    • Dungeon Crawl System: AI Dungeon Master with adaptive narration
    • Cross-Realm Conflicts: War, trade, and alliance systems
    • AI Mask Network: Persistent NPC personalities that evolve
    • D&D-inspired mechanics with AI probability weighting
    • Multiplayer raids and guild systems
    • Economy simulation with resource management
    • Character export and import across campaigns`,
    related: ["RPG", "World Building", "AI DM"],
    actions: ["enter_mythaquest", "create_character", "explore_worlds"]
  },

  // SPARKS ECONOMY
  {
    topic: "Sparks Currency",
    category: "economy",
    content: `Sparks is the universal AI currency across all MythaTron applications. Economics:
    
    • Base rate: 1 Spark = $0.02 USD
    • Dynamic pricing based on AI compute intensity
    • Volume bonuses for bulk purchases
    • Tier multipliers (Free, Creator, Guild, Prime)
    • Real-time cost optimization ensuring 65%+ profit margins
    • Earn Sparks through gameplay achievements
    • Transfer between users for collaboration
    • Monthly subscription options for unlimited features
    • Transparent pricing with cost breakdowns
    • Automatic refunds for failed AI generations`,
    related: ["Pricing", "Purchases", "Rewards"],
    actions: ["check_balance", "buy_sparks", "view_pricing"]
  },

  // SOCIAL FEATURES
  {
    topic: "Social & Collaboration",
    category: "social",
    content: `MythaTron's social layer enables real-time collaboration and community building:
    
    • Friend system with mutual connections
    • Real-time messaging with Ably integration
    • Group creation for collaborative projects
    • Feed system for sharing creations
    • Achievements and leaderboards
    • Spectator mode for live sessions
    • Creator network for finding collaborators
    • Democratic ad system for fair promotion
    • Event hosting and tournaments
    • Revenue sharing for collaborative works`,
    related: ["Friends", "Messages", "Groups"],
    actions: ["view_friends", "send_message", "create_group"]
  },

  // TECHNICAL FEATURES
  {
    topic: "Technical Architecture",
    category: "technical",
    content: `MythaTron is built with cutting-edge technology for performance and scalability:
    
    • Frontend: React 18 with TypeScript, Vite bundler
    • Backend: Supabase (PostgreSQL, Auth, Realtime)
    • AI: OpenAI GPT-4, Claude, Custom models
    • Real-time: Ably for WebSocket connections
    • Hosting: Vercel (frontend), Render (services)
    • State: Zustand for client state management
    • Styling: Tailwind CSS with custom futuristic theme
    • Security: Row-level security, encrypted storage
    • Performance: <50ms API response, 99.9% uptime
    • Scale: Supports 1M+ concurrent users`,
    related: ["Performance", "Security", "Stack"],
    actions: ["view_status", "check_performance", "report_issue"]
  },

  // USER TIERS
  {
    topic: "Subscription Tiers",
    category: "pricing",
    content: `MythaTron offers flexible pricing tiers for different user needs:
    
    FREE TIER:
    • 100 Sparks monthly
    • Basic features access
    • Community support
    
    CREATOR ($19/month):
    • 2,500 Sparks monthly
    • Advanced AI features
    • Priority processing
    • Export capabilities
    
    GUILD ($49/month):
    • 10,000 Sparks monthly
    • Team collaboration
    • Custom models
    • Analytics dashboard
    
    PRIME ($99/month):
    • Unlimited Sparks
    • White-label options
    • API access
    • Dedicated support`,
    related: ["Pricing", "Features", "Upgrades"],
    actions: ["view_tiers", "upgrade_plan", "compare_features"]
  },

  // HELP & SUPPORT
  {
    topic: "Getting Help",
    category: "support",
    content: `Multiple ways to get help with MythaTron:
    
    • OmniGuide AI: I'm here 24/7 for instant help
    • Documentation: Comprehensive guides for all features
    • Video Tutorials: Step-by-step walkthroughs
    • Community Forum: Connect with other users
    • Bug Reports: Submit through me (OmniGuide)
    • Feature Requests: Share your ideas
    • Live Chat: Available for Guild and Prime tiers
    • Email Support: support@mythatron.com
    • Discord Server: Join our community
    • FAQ Section: Common questions answered`,
    related: ["Support", "Documentation", "Community"],
    actions: ["view_docs", "submit_ticket", "join_discord"]
  },

  // TIPS & TRICKS
  {
    topic: "Pro Tips",
    category: "tips",
    content: `Master MythaTron with these power user tips:
    
    • Keyboard Shortcuts: Cmd/Ctrl+K opens me (OmniGuide)
    • Batch Operations: Select multiple items with Shift+Click
    • Quick Navigation: Use number keys 1-9 for main sections
    • AI Optimization: Provide detailed prompts for better results
    • Collaboration: Share session links for instant co-creation
    • Sparks Saving: Use batch generation to reduce costs
    • Export Options: Choose format before generating for best quality
    • Performance: Close unused tabs for faster experience
    • Customization: Adjust UI density in settings
    • Easter Eggs: Try the Konami code on the dashboard!`,
    related: ["Shortcuts", "Optimization", "Features"],
    actions: ["view_shortcuts", "settings", "explore_features"]
  }
];

// Function to search knowledge base
export function searchKnowledge(query: string): KnowledgeEntry[] {
  const lowerQuery = query.toLowerCase();
  
  return OMNIGUIDE_KNOWLEDGE.filter(entry => 
    entry.topic.toLowerCase().includes(lowerQuery) ||
    entry.content.toLowerCase().includes(lowerQuery) ||
    entry.category.toLowerCase().includes(lowerQuery) ||
    entry.related.some(r => r.toLowerCase().includes(lowerQuery))
  );
}

// Function to get related topics
export function getRelatedTopics(topic: string): KnowledgeEntry[] {
  const entry = OMNIGUIDE_KNOWLEDGE.find(e => 
    e.topic.toLowerCase() === topic.toLowerCase()
  );
  
  if (!entry) return [];
  
  return OMNIGUIDE_KNOWLEDGE.filter(e => 
    entry.related.some(r => 
      e.topic.toLowerCase().includes(r.toLowerCase()) ||
      e.category.toLowerCase().includes(r.toLowerCase())
    )
  );
}

// Function to get category entries
export function getCategoryKnowledge(category: string): KnowledgeEntry[] {
  return OMNIGUIDE_KNOWLEDGE.filter(entry => 
    entry.category.toLowerCase() === category.toLowerCase()
  );
}

// Categories for organization
export const KNOWLEDGE_CATEGORIES = [
  { id: 'overview', name: 'Platform Overview', icon: '🌐' },
  { id: 'games', name: 'Games & Entertainment', icon: '🎮' },
  { id: 'creative', name: 'Creative Tools', icon: '🎨' },
  { id: 'economy', name: 'Economy & Currency', icon: '💎' },
  { id: 'social', name: 'Social Features', icon: '👥' },
  { id: 'technical', name: 'Technical Details', icon: '⚙️' },
  { id: 'pricing', name: 'Pricing & Tiers', icon: '💰' },
  { id: 'support', name: 'Help & Support', icon: '🆘' },
  { id: 'tips', name: 'Tips & Tricks', icon: '💡' }
];
