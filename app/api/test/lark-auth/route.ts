// Simple Lark Auth Test Endpoint
// Tests Lark OAuth configuration without complex logic

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.LARK_CLIENT_ID;
    const redirectUri = process.env.LARK_REDIRECT_URI || "http://localhost:3000/api/auth/callback/lark";
    
    // Simple auth URL for testing
    const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user:read`;
    
    return NextResponse.json({
      success: true,
      message: "Lark auth test",
      data: {
        clientId: clientId,
        redirectUri: redirectUri,
        authUrl: authUrl,
        instructions: [
          "1. Make sure OAuth 2.0 is enabled in Lark Developer Console",
          "2. Set redirect URI in Lark console to: " + redirectUri,
          "3. Add scope: user:read",
          "4. Test the auth URL above"
        ]
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Test failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
