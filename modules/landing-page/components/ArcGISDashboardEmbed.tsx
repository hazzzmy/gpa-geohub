'use client';

import { useArcGISToken } from '@/hooks/use-arcgis-token';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface ArcGISDashboardEmbedProps {
  dashboardUrl: string;
  title?: string;
  className?: string;
}

export default function ArcGISDashboardEmbed({
  dashboardUrl,
  title = 'Dashboard',
  className = '',
}: ArcGISDashboardEmbedProps) {
  const { token, isLoading, error, refreshToken } = useArcGISToken();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Build iframe URL with token and proper authentication parameters
  useEffect(() => {
    if (!token) {
      setIframeUrl(null);
      return;
    }

    try {
      const url = new URL(dashboardUrl);

      // Set token parameter - this will authenticate the iframe
      url.searchParams.set('token', token);

      // Add additional parameters for proper authentication
      // This ensures the dashboard/webapp uses the token without prompting for login
      url.searchParams.set('redirect', 'false');

      // For ArcGIS Portal apps, also add the portal parameter if needed
      if (!url.searchParams.has('portal')) {
        // Portal URL is typically in the dashboard URL already, but we ensure token is passed
      }

      const finalUrl = url.toString();
      setIframeUrl(finalUrl);

      // Force iframe reload when token changes
      setIframeKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error building iframe URL:', err);
      setIframeUrl(null);
    }
  }, [token, dashboardUrl]);

  // Auto-refresh token if it expires while dashboard is loaded
  useEffect(() => {
    if (!token || isLoading) return;

    const checkToken = async () => {
      // Check if we need to refresh (will be handled by useArcGISToken hook)
      // But we can also manually refresh if needed
      try {
        await refreshToken();
      } catch (err) {
        console.error('Error refreshing token:', err);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, isLoading, refreshToken]);

  if (isLoading) {
    return (
      <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading ArcGIS Dashboard...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">Failed to load dashboard</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!iframeUrl) {
    return (
      <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">No authentication token available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden py-0${className}`}>
      <CardContent className="p-0">
        <iframe
          key={iframeKey}
          src={iframeUrl || undefined}
          className="w-full h-[1000px] border-0"
          title={title}
          allow="geolocation *; microphone *; camera *"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </CardContent>
    </Card>
  );
}

