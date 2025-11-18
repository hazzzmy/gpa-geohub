// ArcGIS Token API Route
// Provides token generation and management for ArcGIS Enterprise

import { NextRequest, NextResponse } from "next/server";
import { getValidToken, clearCachedToken } from "@/lib/arcgis/config";

/**
 * GET /api/arcgis/token
 * Returns a valid ArcGIS Enterprise token
 * Automatically handles token refresh if expired
 */
export async function GET(request: NextRequest) {
  try {
    // Get valid token (will generate new one if needed)
    const tokenData = await getValidToken();

    return NextResponse.json({
      success: true,
      token: tokenData.token,
      expires: tokenData.expires,
      expiresAt: new Date(tokenData.expires).toISOString(),
      ssl: tokenData.ssl,
    });
  } catch (error) {
    console.error("❌ Error getting ArcGIS token:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get ArcGIS token",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/arcgis/token/refresh
 * Forces a token refresh
 */
export async function POST(request: NextRequest) {
  try {
    // Clear cached token to force refresh
    clearCachedToken();
    
    // Generate new token
    const tokenData = await getValidToken();

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      token: tokenData.token,
      expires: tokenData.expires,
      expiresAt: new Date(tokenData.expires).toISOString(),
      ssl: tokenData.ssl,
    });
  } catch (error) {
    console.error("❌ Error refreshing ArcGIS token:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to refresh ArcGIS token",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/arcgis/token
 * Clears the cached token
 */
export async function DELETE(request: NextRequest) {
  try {
    clearCachedToken();

    return NextResponse.json({
      success: true,
      message: "Token cache cleared successfully",
    });
  } catch (error) {
    console.error("❌ Error clearing token cache:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear token cache",
      },
      { status: 500 }
    );
  }
}


