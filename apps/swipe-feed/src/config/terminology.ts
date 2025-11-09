/**
 * Global Terminology Configuration
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

// Platform terminology - centralized for easy updates
export const TERMS = {
  // Social connections (formerly BookWorms)
  CONNECTION: 'Creator',
  CONNECTIONS: 'Creators',
  CONNECTION_LOWER: 'creator',
  CONNECTIONS_LOWER: 'creators',
  
  // Actions
  CONNECT: 'Connect',
  CONNECTED: 'Connected',
  CONNECTING: 'Connecting',
  
  // Network
  NETWORK_NAME: 'Creator Network',
  NETWORK_DESCRIPTION: 'Your creative connections',
  
  // Invitations
  INVITE_CREATOR: 'Invite Creator',
  CREATOR_REQUEST: 'Creator Request',
  
  // UI Labels
  MY_CREATORS: 'My Creators',
  FIND_CREATORS: 'Find Creators',
  SUGGESTED_CREATORS: 'Suggested Creators',
  FELLOW_CREATOR: 'Fellow Creator',
  
  // Messages
  NO_CREATORS_YET: 'No creators yet',
  INVITE_A_CREATOR: 'Invite a creator',
  CREATOR_JOINED: 'New creator joined',
  CREATOR_LEFT: 'Creator left',
  
  // Settings
  ALLOW_CREATOR_INVITES: 'Allow Creator invites',
  CREATOR_VISIBILITY: 'Creator visibility',
} as const;

// Legacy term mapping for migration
export const LEGACY_TERMS = {
  'BookWorm': TERMS.CONNECTION,
  'BookWorms': TERMS.CONNECTIONS,
  'bookworm': TERMS.CONNECTION_LOWER,
  'bookworms': TERMS.CONNECTIONS_LOWER,
  'BookWorm Network': TERMS.NETWORK_NAME,
  'Bookworm Network': TERMS.NETWORK_NAME,
  'Fellow BookWorm': TERMS.FELLOW_CREATOR,
} as const;
