'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface ArcGISDashboardEmbedProxyProps {
  /**
   * ArcGIS Portal URL path (relative to portal URL)
   * Examples:
   * - "apps/dashboards/118f24e23de84824ab01b0565a6050c9"
   * - "apps/webappviewer/index.html?id=9df4b5c46b30432b98d90ddb937cffeb"
   * - "apps/instant/filtergallery/index.html?appid=e9f8c21ab2b5459ebd821ad24f855299"
   */
  portalPath: string;
  title?: string;
  className?: string;
}

/**
 * ArcGIS Dashboard Embed using Proxy API
 * More secure approach - token is never exposed to client
 *
 * Usage:
 * <ArcGISDashboardEmbedProxy
 *   portalPath="apps/dashboards/118f24e23de84824ab01b0565a6050c9"
 *   title="Land Clearing Dashboard"
 * />
 */
export default function ArcGISDashboardEmbedProxy({
  portalPath,
  title = 'Dashboard',
  className = '',
}: ArcGISDashboardEmbedProxyProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build proxy URL
  const proxyUrl = `/api/arcgis-proxy/${portalPath}`;

  useEffect(() => {
    // Set loading to false after initial render
    setIsLoading(false);
  }, []);

  // Handle iframe load events
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load dashboard');
  };

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

  return (
    <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden py-0 ${className}`}>
      {isLoading && (
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading ArcGIS Dashboard...</p>
            </div>
          </div>
        </CardContent>
      )}
      <CardContent className="p-0">
        <iframe
          src={proxyUrl}
          className="w-full h-[1000px] border-0"
          title={title}
          allow="geolocation *; microphone *; camera *"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </CardContent>
    </Card>
  );
}


