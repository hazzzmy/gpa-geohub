import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getUserWithRoles } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("lark-session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null, session: null });
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      return NextResponse.json({ user: null, session: null });
    }

    // Get full user data with roles and permissions
    const userWithRoles = await getUserWithRoles(session.user.id);

    return NextResponse.json({
      user: userWithRoles,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}

