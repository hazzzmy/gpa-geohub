// Debug Callback Endpoint
// Helps debug OAuth callback parameters

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const callbackData = {
      code: searchParams.get("code"),
      state: searchParams.get("state"),
      error: searchParams.get("error"),
      error_description: searchParams.get("error_description"),
      allParams: Object.fromEntries(searchParams.entries()),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    };
    
    console.log("🔍 Callback Debug Data:", callbackData);
    
    return NextResponse.json({
      success: true,
      message: "Callback debug data",
      data: callbackData
    });
    
  } catch (error) {
    console.error("Callback debug error:", error);
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



