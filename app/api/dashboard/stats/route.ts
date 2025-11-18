// Dashboard Stats API
// Real-time statistics for dashboard

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getUserWithRoles } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("lark-session");

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session from database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken.value },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get user data
    const user = await getUserWithRoles(session.user.id);

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 404 });
    }

    // Simple statistics
    const stats = {
      totalUsers: await prisma.user.count({
        where: { isActive: true }
      }),
      activeSessions: await prisma.session.count({
        where: {
          expiresAt: { gt: new Date() }
        }
      }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
