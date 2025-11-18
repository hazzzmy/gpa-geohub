// Auth Type Definitions
// Simplified types for Lark OAuth authentication

export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface SessionUser extends UserWithRoles {
  sessionId?: string;
}


