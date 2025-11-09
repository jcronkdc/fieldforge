/**
 * Centralized naming configuration for the platform
 * These names are used throughout the UI for consistency
 */

export const PLATFORM_NAMES = {
  // Core platform
  platform: 'MythaTron',
  tagline: 'Where Stories Come Alive',
  
  // Currency (changed from MythaCoin)
  currency: 'Sparks',
  currencySymbol: '✨',
  currencyPlural: 'Sparks',
  
  // Social connections (changed from BookWorms)
  connections: 'Collaborators',
  connectionSingular: 'Collaborator',
  connectionRequest: 'Collaboration Request',
  
  // Dashboard names
  mainDashboard: 'Prologue', // Keep as is - it's good
  
  // Feed names (simplified)
  discoveryFeed: 'Discovery', // Changed from Aurora Feed
  activityStream: 'The Stream', // Changed from MythaStream
  
  // Features
  angryLips: 'Angry Lips', // Keep as requested
  storyEngine: 'Story Engine',
  characterEngine: 'Character Engine',
  
  // Collections (changed from Vault)
  collection: 'Collection',
  archive: 'Archive',
  library: 'Library',
  
  // User roles
  host: 'Host',
  participant: 'Participant',
  creator: 'Creator',
  collaborator: 'Collaborator',
  
  // Actions
  earn: 'Earn',
  spend: 'Spend',
  reward: 'Reward',
  
  // Privacy levels
  privacyLevels: {
    maximum: 'Maximum Privacy',
    high: 'Enhanced Privacy',
    standard: 'Standard Privacy'
  }
} as const;

// Helper functions for consistent usage
export function formatCurrency(amount: number): string {
  return `${amount} ${amount === 1 ? PLATFORM_NAMES.currency : PLATFORM_NAMES.currencyPlural}`;
}

export function formatCurrencyWithSymbol(amount: number): string {
  return `${PLATFORM_NAMES.currencySymbol} ${amount}`;
}

export function getConnectionLabel(count: number): string {
  return count === 1 
    ? PLATFORM_NAMES.connectionSingular 
    : PLATFORM_NAMES.connections;
}

// Restricted usernames that cannot be used
export const RESTRICTED_USERNAMES = [
  'mythatron',
  'admin',
  'administrator',
  'moderator',
  'mod',
  'staff',
  'support',
  'help',
  'official',
  'system',
  'bot',
  'api',
  'root',
  'superuser',
  'test',
  'demo'
];

// Patterns to detect in content for auto-moderation
export const SPAM_PATTERNS = [
  // Advertising
  /buy\s+now/gi,
  /click\s+here/gi,
  /visit\s+my/gi,
  /check\s+out\s+my/gi,
  /follow\s+me\s+on/gi,
  /subscribe/gi,
  /discount/gi,
  /promo(?:tion)?/gi,
  /sale/gi,
  
  // Cryptocurrency/Finance
  /bitcoin/gi,
  /crypto/gi,
  /forex/gi,
  /trading/gi,
  /nft/gi,
  /investment/gi,
  
  // External links (except mythatron.com)
  /https?:\/\/(?!mythatron\.com)/gi,
  /bit\.ly/gi,
  /tinyurl/gi,
  /goo\.gl/gi,
  
  // Currency symbols suggesting commerce
  /[\$€£¥₹₿]/g,
];

// Privacy settings defaults
export const DEFAULT_PRIVACY_SETTINGS = {
  profile_visibility: 'public',
  message_privacy: 'collaborators',
  story_visibility: 'public', 
  activity_visibility: 'collaborators',
  data_collection: 'essential',
  search_indexing: true,
  analytics_opt_out: false,
  third_party_sharing: false
};

// Rate limits for different actions
export const RATE_LIMITS = {
  messages: {
    perMinute: 10,
    perHour: 100,
    perDay: 500
  },
  connections: {
    perHour: 10,
    perDay: 30
  },
  stories: {
    perHour: 5,
    perDay: 20
  },
  angryLips: {
    perHour: 3,
    perDay: 10
  },
  reactions: {
    perMinute: 30,
    perHour: 200
  }
};

// Ethical guidelines
export const ETHICAL_GUIDELINES = {
  // Data minimization
  dataRetention: '90 days for non-essential data',
  
  // Transparency
  algorithmTransparency: 'All feed algorithms are open source',
  
  // User control
  dataExport: 'Users can export all their data anytime',
  accountDeletion: 'Complete data deletion within 30 days',
  
  // No dark patterns
  noDarkPatterns: [
    'No infinite scroll tricks',
    'No engagement manipulation',
    'No hidden costs',
    'Clear unsubscribe options'
  ],
  
  // Content moderation
  moderationPrinciples: [
    'Community-driven moderation',
    'Transparent appeal process',
    'No shadowbanning',
    'Clear community guidelines'
  ]
};
