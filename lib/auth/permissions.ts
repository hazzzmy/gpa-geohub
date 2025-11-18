// Permission Constants
// Simplified permission definitions (no complex role management)

export const PERMISSIONS = {
  // Basic Features
  DASHBOARD_ACCESS: "dashboard:access",
  REPORTS_ACCESS: "reports:access",
  SETTINGS_ACCESS: "settings:access",
  
  // Maps
  MAPS_READ: "maps:read",
  MAPS_WRITE: "maps:write",
} as const;

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// For backward compatibility
export const ROLE_PERMISSIONS = {
  user: [
    PERMISSIONS.DASHBOARD_ACCESS,
    PERMISSIONS.MAPS_READ,
    PERMISSIONS.REPORTS_ACCESS,
  ],
  admin: Object.values(PERMISSIONS),
} as const;

// Type definitions
export type Permission = keyof typeof PERMISSIONS;
export type Role = keyof typeof ROLES;
