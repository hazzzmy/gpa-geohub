// Auth Utilities
// Simplified helper functions for Lark OAuth authentication

import { prisma } from "@/lib/db/prisma";

// Re-export types
export type { UserWithRoles, SessionUser } from "./types";

// Fetch user data (simplified - no role/permission DB queries)
export async function getUserWithRoles(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    // Simple structure - everyone has basic access
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      roles: ["user"], // Simple role
      permissions: ["dashboard:access", "maps:read", "reports:access"], // Basic permissions
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
