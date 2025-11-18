// Lark Configuration Debug Endpoint
// Helps debug Lark OAuth configuration issues

import { NextRequest, NextResponse } from "next/server";
import { debugLarkConfig, testLarkEndpoints, buildDebugAuthUrl } from "@/lib/auth/lark-debug";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting Lark Configuration Debug...");
    
    // Debug configuration
    const configValid = debugLarkConfig();
    
    // Test endpoints
    const endpointsValid = await testLarkEndpoints();
    
    // Build debug auth URL
    const debugAuthUrl = buildDebugAuthUrl();
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      configuration: {
        valid: configValid,
        clientId: process.env.LARK_CLIENT_ID ? "✅ Set" : "❌ Missing",
        clientSecret: process.env.LARK_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
        redirectUri: process.env.LARK_REDIRECT_URI || "❌ Missing",
      },
      endpoints: {
        valid: endpointsValid,
        authUrl: "https://open.feishu.cn/open-apis/authen/v1/authorize",
        tokenUrl: "https://open.feishu.cn/open-apis/authen/v1/access_token",
        userInfoUrl: "https://open.feishu.cn/open-apis/authen/v1/user_info",
      },
      debugAuthUrl: debugAuthUrl,
      recommendations: []
    };
    
    return NextResponse.json({
      success: true,
      message: "Lark configuration debug completed",
      data: debugInfo
    });
    
  } catch (error) {
    console.error("Error in Lark debug endpoint:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Debug failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}



