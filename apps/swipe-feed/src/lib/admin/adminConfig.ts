/**
 * ADMIN CONFIGURATION - IMMUTABLE
 * Primary admin: justincronk@pm.me (MythaTron)
 * DO NOT MODIFY WITHOUT PERMISSION
 */

// Supreme admin with unlimited access
export const SUPREME_ADMIN_EMAIL = 'justincronk@pm.me';
export const SUPREME_ADMIN_USERNAME = 'MythaTron';

// Secondary admin accounts
export const ADMIN_EMAILS = [
  'justincronk@pm.me',  // Primary MythaTron Admin - UNLIMITED ACCESS
  'jwcronk82@gmail.com' // Secondary admin
];

// Admin usernames
export const ADMIN_USERNAMES = [
  'MythaTron',
  'mythatron',
  'admin',
  'jwcronk82'
];

/**
 * Check if user is the supreme admin
 */
export function isSupremeAdmin(email?: string | null, username?: string | null): boolean {
  if (!email && !username) return false;
  
  return (
    email?.toLowerCase() === SUPREME_ADMIN_EMAIL.toLowerCase() ||
    username?.toLowerCase() === SUPREME_ADMIN_USERNAME.toLowerCase()
  );
}

/**
 * Check if user is any admin
 */
export function isAdmin(email?: string | null, username?: string | null): boolean {
  if (!email && !username) return false;
  
  // Supreme admin always has access
  if (isSupremeAdmin(email, username)) return true;
  
  // Check admin lists
  const normalizedEmail = email?.toLowerCase();
  const normalizedUsername = username?.toLowerCase();
  
  return (
    (normalizedEmail && ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail)) ||
    (normalizedUsername && ADMIN_USERNAMES.some(u => u.toLowerCase() === normalizedUsername))
  );
}

/**
 * Get admin privileges
 */
export interface AdminPrivileges {
  unlimitedSparks: boolean;
  unlimitedAI: boolean;
  adminDashboard: boolean;
  bypassAllLimits: boolean;
  debugMode: boolean;
  exportData: boolean;
  modifyUsers: boolean;
  systemConfig: boolean;
}

export function getAdminPrivileges(email?: string | null, username?: string | null): AdminPrivileges {
  const supremeAdmin = isSupremeAdmin(email, username);
  const regularAdmin = isAdmin(email, username);
  
  if (supremeAdmin) {
    // Supreme admin gets EVERYTHING
    return {
      unlimitedSparks: true,
      unlimitedAI: true,
      adminDashboard: true,
      bypassAllLimits: true,
      debugMode: true,
      exportData: true,
      modifyUsers: true,
      systemConfig: true
    };
  } else if (regularAdmin) {
    // Regular admins get limited privileges
    return {
      unlimitedSparks: true,
      unlimitedAI: false,  // Limited AI access
      adminDashboard: false, // No admin dashboard
      bypassAllLimits: false,
      debugMode: true,
      exportData: false,
      modifyUsers: false,
      systemConfig: false
    };
  } else {
    // Non-admins get nothing
    return {
      unlimitedSparks: false,
      unlimitedAI: false,
      adminDashboard: false,
      bypassAllLimits: false,
      debugMode: false,
      exportData: false,
      modifyUsers: false,
      systemConfig: false
    };
  }
}

/**
 * Validate admin access to specific features
 */
export function canAccessFeature(
  feature: keyof AdminPrivileges,
  email?: string | null,
  username?: string | null
): boolean {
  const privileges = getAdminPrivileges(email, username);
  return privileges[feature];
}

// Export for use in components
export default {
  SUPREME_ADMIN_EMAIL,
  SUPREME_ADMIN_USERNAME,
  ADMIN_EMAILS,
  ADMIN_USERNAMES,
  isSupremeAdmin,
  isAdmin,
  getAdminPrivileges,
  canAccessFeature
};
