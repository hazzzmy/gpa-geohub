// Custom hook for ArcGIS token management
// Provides easy access to ArcGIS Enterprise tokens in React components

import { useEffect, useState } from "react";

export interface ArcGISTokenData {
  token: string;
  expires: number;
  expiresAt: string;
  ssl: boolean;
}

export interface UseArcGISTokenResult {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  isExpired: boolean;
}

/**
 * Hook to manage ArcGIS Enterprise token
 * Automatically fetches and refreshes token when needed
 */
export function useArcGISToken(): UseArcGISTokenResult {
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<ArcGISTokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if token is expired or about to expire (within 5 minutes)
  const isExpired =
    tokenData !== null &&
    tokenData.expires - Date.now() < 5 * 60 * 1000;

  // Fetch token from API
  const fetchToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/arcgis/token");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch ArcGIS token");
      }

      setToken(data.token);
      setTokenData({
        token: data.token,
        expires: data.expires,
        expiresAt: data.expiresAt,
        ssl: data.ssl,
      });

      console.log("✅ ArcGIS token fetched successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("❌ Error fetching ArcGIS token:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token manually or when expired
  const refreshToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/arcgis/token", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to refresh ArcGIS token");
      }

      setToken(data.token);
      setTokenData({
        token: data.token,
        expires: data.expires,
        expiresAt: data.expiresAt,
        ssl: data.ssl,
      });

      console.log("✅ ArcGIS token refreshed successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("❌ Error refreshing ArcGIS token:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!tokenData) return;

    const checkInterval = setInterval(() => {
      const timeUntilExpiry = tokenData.expires - Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
        console.log("⏰ Token expiring soon, auto-refreshing...");
        refreshToken();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [tokenData]);

  return {
    token,
    isLoading,
    error,
    refreshToken,
    isExpired,
  };
}


