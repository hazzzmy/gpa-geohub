// Lark (Feishu) OAuth Configuration
// Integration with Lark SSO for GeoHUB

export const LARK_CONFIG = {
  // Lark OAuth App Configuration
  clientId: process.env.LARK_CLIENT_ID || "cli_a85200ae53389029",
  clientSecret: process.env.LARK_CLIENT_SECRET || "lMLd8DcphPYOov8UaNjsaeQesKkVazpJ",
  redirectUri: process.env.LARK_REDIRECT_URI || "http://localhost:3000/api/auth/callback/lark",
  
  // Lark API Endpoints
  authUrl: "https://open.feishu.cn/open-apis/authen/v1/authorize",
  tokenUrl: "https://open.feishu.cn/open-apis/authen/v1/access_token",
  userInfoUrl: "https://open.feishu.cn/open-apis/authen/v1/user_info",
  
  // Scopes for Lark OAuth - using existing scope from your app
  scopes: "admin:app.enable:write",
  
  // Lark API Version
  apiVersion: "v1",
};

// Lark User Data Interface
export interface LarkUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  position?: string;
  mobile?: string;
  employee_id?: string;
}

// Lark OAuth Response Interface
export interface LarkTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  user_data: {
    name: string;
    email: string;
    avatar?: string;
    open_id: string;
    union_id: string;
  };
}

// Lark User Info Response Interface
export interface LarkUserInfoResponse {
  code: number;
  msg: string;
  data: {
    user_id: string;
    name: string;
    email: string;
    avatar_url?: string;
    department_ids?: string[];
    employee_id?: string;
    mobile?: string;
  };
}

// Helper function to build Lark OAuth URL
export function buildLarkAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    app_id: LARK_CONFIG.clientId,
    redirect_uri: LARK_CONFIG.redirectUri,
    response_type: "code",
    ...(LARK_CONFIG.scopes && { scope: LARK_CONFIG.scopes }),
    ...(state && { state }),
  });

  console.log("🔍 Lark Auth params:", params.toString());
  
  return `${LARK_CONFIG.authUrl}?${params.toString()}`;
}

// Helper function to exchange code for token
export async function exchangeCodeForToken(code: string): Promise<LarkTokenResponse> {
  console.log("🔍 Token exchange request:", {
    url: LARK_CONFIG.tokenUrl,
    appId: LARK_CONFIG.clientId,
    appSecret: LARK_CONFIG.clientSecret ? "✅ Set" : "❌ Missing",
    redirectUri: LARK_CONFIG.redirectUri,
    code: code.substring(0, 10) + "..."
  });

  const response = await fetch(LARK_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      app_id: LARK_CONFIG.clientId,
      app_secret: LARK_CONFIG.clientSecret,
      code,
      redirect_uri: LARK_CONFIG.redirectUri,
    }),
  });
  
  const responseText = await response.text();
  console.log("🔍 Token response:", response.status, responseText);
  
  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.status} ${responseText}`);
  }
  
  const tokenData = JSON.parse(responseText);
  
  // Check if Lark returned an error
  if (tokenData.code && tokenData.code !== 0) {
    throw new Error(`Lark API error: ${tokenData.msg} (Code: ${tokenData.code})`);
  }
  
  // Return the token data with access_token extracted
  return {
    access_token: tokenData.data.access_token,
    token_type: tokenData.data.token_type,
    expires_in: tokenData.data.expires_in,
    refresh_token: tokenData.data.refresh_token,
    scope: tokenData.data.scope || "",
    // Include additional user data from token response
    user_data: {
      name: tokenData.data.name,
      email: tokenData.data.email || tokenData.data.open_id, // Use open_id if email not available
      avatar: tokenData.data.avatar_url,
      open_id: tokenData.data.open_id,
      union_id: tokenData.data.union_id,
    }
  };
}

// Helper function to get user info from Lark
export async function getLarkUserInfo(accessToken: string): Promise<LarkUser> {
  // Check if accessToken is valid
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error(`Invalid access token: ${accessToken}`);
  }

  console.log("🔍 User info request:", {
    url: LARK_CONFIG.userInfoUrl,
    token: accessToken.substring(0, 20) + "..."
  });

  const response = await fetch(LARK_CONFIG.userInfoUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  
  const responseText = await response.text();
  console.log("🔍 User info response:", response.status, responseText);
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status} ${responseText}`);
  }
  
  const data: LarkUserInfoResponse = JSON.parse(responseText);
  
  if (data.code !== 0) {
    throw new Error(`Lark API error: ${data.msg}`);
  }
  
  return {
    id: data.data.user_id,
    name: data.data.name,
    email: data.data.email,
    avatar: data.data.avatar_url,
    department: data.data.department_ids?.[0], // Primary department
    employee_id: data.data.employee_id,
    mobile: data.data.mobile,
  };
}
