// Lark Configuration Debug Utility
// Helps debug Lark OAuth configuration issues

import { LARK_CONFIG } from "./lark-config";

export function debugLarkConfig() {
  console.log("🔍 Lark Configuration Debug:");
  console.log("================================");
  
  // Check environment variables
  console.log("Environment Variables:");
  console.log("- LARK_CLIENT_ID:", process.env.LARK_CLIENT_ID ? "✅ Set" : "❌ Missing");
  console.log("- LARK_CLIENT_SECRET:", process.env.LARK_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
  console.log("- LARK_REDIRECT_URI:", process.env.LARK_REDIRECT_URI ? "✅ Set" : "❌ Missing");
  
  // Check Lark config
  console.log("\nLark Config:");
  console.log("- Client ID:", LARK_CONFIG.clientId);
  console.log("- Client Secret:", LARK_CONFIG.clientSecret ? "✅ Set" : "❌ Missing");
  console.log("- Redirect URI:", LARK_CONFIG.redirectUri);
  console.log("- Auth URL:", LARK_CONFIG.authUrl);
  console.log("- Token URL:", LARK_CONFIG.tokenUrl);
  console.log("- User Info URL:", LARK_CONFIG.userInfoUrl);
  
  // Validate configuration
  console.log("\nValidation:");
  const isValid = validateLarkConfig();
  console.log("- Configuration Valid:", isValid ? "✅ Yes" : "❌ No");
  
  if (!isValid) {
    console.log("\n❌ Issues found:");
    if (!LARK_CONFIG.clientId) console.log("  - Client ID is missing");
    if (!LARK_CONFIG.clientSecret) console.log("  - Client Secret is missing");
    if (!LARK_CONFIG.redirectUri) console.log("  - Redirect URI is missing");
  }
  
  return isValid;
}

export function validateLarkConfig(): boolean {
  return !!(
    LARK_CONFIG.clientId &&
    LARK_CONFIG.clientSecret &&
    LARK_CONFIG.redirectUri
  );
}

export function buildDebugAuthUrl(): string {
  const params = new URLSearchParams({
    app_id: LARK_CONFIG.clientId,
    redirect_uri: LARK_CONFIG.redirectUri,
    response_type: "code",
    ...(LARK_CONFIG.scopes && { scope: LARK_CONFIG.scopes }),
  });
  
  return `${LARK_CONFIG.authUrl}?${params.toString()}`;
}

// Test function to validate Lark API endpoints
export async function testLarkEndpoints() {
  console.log("🧪 Testing Lark API Endpoints:");
  console.log("================================");
  
  try {
    // Test auth URL
    console.log("1. Testing Auth URL...");
    const authUrl = buildDebugAuthUrl();
    console.log("   Auth URL:", authUrl);
    
    // Test if URLs are accessible
    console.log("2. Testing API endpoints accessibility...");
    
    // Note: We can't actually test the endpoints without proper credentials
    // but we can validate the URL format
    const authUrlObj = new URL(LARK_CONFIG.authUrl);
    const tokenUrlObj = new URL(LARK_CONFIG.tokenUrl);
    const userInfoUrlObj = new URL(LARK_CONFIG.userInfoUrl);
    
    console.log("   ✅ Auth URL format valid");
    console.log("   ✅ Token URL format valid");
    console.log("   ✅ User Info URL format valid");
    
    return true;
  } catch (error) {
    console.error("   ❌ Error testing endpoints:", error);
    return false;
  }
}


