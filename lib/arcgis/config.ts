// ArcGIS Enterprise Configuration
// This file handles authentication and token management for ArcGIS Enterprise

export interface ArcGISEnterpriseConfig {
  portalUrl: string;
  username: string;
  password: string;
  referer?: string;
}

export interface ArcGISToken {
  token: string;
  expires: number;
  ssl: boolean;
}

export interface ArcGISTokenResponse {
  token: string;
  expires: number;
  ssl?: boolean;
  error?: {
    code: number;
    message: string;
    details: string[];
  };
}

// Get ArcGIS Enterprise configuration from environment variables
export function getArcGISConfig(): ArcGISEnterpriseConfig {
  const portalUrl = process.env.ARCGIS_PORTAL_URL;
  const username = process.env.ARCGIS_USERNAME;
  const password = process.env.ARCGIS_PASSWORD;
  const referer = process.env.ARCGIS_REFERER || process.env.NEXT_PUBLIC_APP_URL;

  if (!portalUrl || !username || !password) {
    throw new Error(
      "Missing ArcGIS Enterprise credentials. Please set ARCGIS_PORTAL_URL, ARCGIS_USERNAME, and ARCGIS_PASSWORD in your environment variables."
    );
  }

  return {
    portalUrl,
    username,
    password,
    referer,
  };
}

/**
 * Generate ArcGIS Enterprise token
 * @param config ArcGIS Enterprise configuration
 * @returns Token response with token and expiration
 */
export async function generateArcGISToken(
  config?: ArcGISEnterpriseConfig
): Promise<ArcGISToken> {
  const arcgisConfig = config || getArcGISConfig();

  // Construct the token generation URL
  const tokenUrl = `${arcgisConfig.portalUrl}/sharing/rest/generateToken`;

  // Prepare form data for token request
  // Use a more permissive referer to allow embedding from different origins
  const referer = arcgisConfig.referer || "http://localhost:3000";

  const formData = new URLSearchParams({
    username: arcgisConfig.username,
    password: arcgisConfig.password,
    referer: referer,
    f: "json",
    expiration: "60", // Token expires in 60 minutes
    client: "referer", // Use referer-based authentication for better compatibility with iframes
  });

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ArcGISTokenResponse = await response.json();

    if (data.error) {
      throw new Error(
        `ArcGIS Token Error: ${data.error.message} (Code: ${data.error.code})`
      );
    }

    if (!data.token || !data.expires) {
      throw new Error("Invalid token response from ArcGIS Enterprise");
    }

    return {
      token: data.token,
      expires: data.expires,
      ssl: data.ssl || false,
    };
  } catch (error) {
    console.error("Error generating ArcGIS token:", error);
    throw error;
  }
}

/**
 * Check if token is expired or about to expire (within 5 minutes)
 * @param expiresTimestamp Token expiration timestamp (milliseconds)
 * @returns True if token is expired or about to expire
 */
export function isTokenExpired(expiresTimestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return expiresTimestamp - now < fiveMinutes;
}

/**
 * Get or refresh ArcGIS token from cache/storage
 * This function checks if we have a valid token in memory/storage
 * If not, it generates a new one
 */
let cachedToken: ArcGISToken | null = null;

export async function getValidToken(): Promise<ArcGISToken> {
  // Check if we have a cached token and it's still valid
  if (cachedToken && !isTokenExpired(cachedToken.expires)) {
    console.log("✅ Using cached ArcGIS token");
    return cachedToken;
  }

  // Generate new token
  console.log("🔄 Generating new ArcGIS token...");
  cachedToken = await generateArcGISToken();
  console.log(
    `✅ New ArcGIS token generated, expires at: ${new Date(cachedToken.expires).toISOString()}`
  );

  return cachedToken;
}

/**
 * Clear cached token (useful for logout or token invalidation)
 */
export function clearCachedToken(): void {
  cachedToken = null;
  console.log("🗑️ ArcGIS token cache cleared");
}

