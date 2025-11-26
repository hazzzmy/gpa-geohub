// Lark OAuth Callback Handler
// Handles the OAuth callback from Lark and creates/updates user session

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/auth/lark-config";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    // Debug Lark configuration
    const { debugLarkConfig } = await import("@/lib/auth/lark-debug");
    debugLarkConfig();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    console.log("🔍 Lark OAuth Callback Debug:");
    console.log("- Code:", code ? "✅ Present" : "❌ Missing");
    console.log("- State:", state ? "✅ Present" : "❌ Missing");
    console.log("- Error:", error || "None");

    // Handle OAuth errors
    if (error) {
      console.error("Lark OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/auth/signin?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=missing_code", request.url)
      );
    }

    // Exchange code for access token
    console.log("🔄 Exchanging code for token...");
    const tokenResponse = await exchangeCodeForToken(code);
    console.log("✅ Token received:", tokenResponse);
    
    // Use user data from token response (Lark provides user info in token response)
    // Generate a valid email format since Lark doesn't provide real email
    const larkUser = {
      id: tokenResponse.user_data.open_id,
      name: tokenResponse.user_data.name,
      email: `${tokenResponse.user_data.open_id}@lark.local`, // Generate valid email format
      avatar: tokenResponse.user_data.avatar,
    };
    console.log("✅ User info extracted from token:", larkUser);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: larkUser.email },
    });

    if (!user) {
      // Create new user directly in database (Better Auth will handle session)
      user = await prisma.user.create({
        data: {
          name: larkUser.name,
          email: larkUser.email,
          password: crypto.randomUUID(), // Random password for OAuth users
          isActive: true,
          emailVerified: true,
          avatar: larkUser.avatar,
        },
      });

      // Create Lark account record
      await prisma.account.create({
        data: {
          accountId: larkUser.id,
          providerId: "lark",
          userId: user.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          scope: tokenResponse.scope,
        },
      });

      // User created successfully - no role/organization management needed

      console.log(`✅ New user created via Lark OAuth: ${larkUser.email}`);
    } else {
      // Update existing user's Lark account
      await prisma.account.upsert({
        where: {
          providerId_accountId: {
            providerId: "lark",
            accountId: larkUser.id,
          },
        },
        update: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          scope: tokenResponse.scope,
        },
        create: {
          accountId: larkUser.id,
          providerId: "lark",
          userId: user.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          scope: tokenResponse.scope,
        },
      });

      // Update user info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: larkUser.avatar,
          isActive: true,
        },
      });

      console.log(`✅ Existing user updated via Lark OAuth: ${larkUser.email}`);
    }

    // Create simple session for OAuth user
    console.log("🔄 Creating session for OAuth user...");
    
    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Create session in database
    await prisma.session.create({
      data: {
        id: sessionToken,
        userId: user.id,
        expiresAt: expiresAt,
        token: sessionToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    console.log(`✅ Session created for OAuth user: ${larkUser.email}`);

    // Get redirectTo from state or default to "/"
    // Note: redirectTo might be stored in state parameter or cookie
    // For now, default to "/" as requested
    const redirectTo = "/";

    // Set session cookie and redirect
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    
    // Set the session cookie
    response.cookies.set("lark-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("🚨 Lark OAuth callback error:", error);
    console.error("🚨 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.redirect(
      new URL(
        `/auth/signin?error=${encodeURIComponent("oauth_callback_failed")}`,
        request.url
      )
    );
  }
}
