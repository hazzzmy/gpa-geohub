// ArcGIS Proxy API Route
// Forwards requests to ArcGIS Portal/Server with token authentication
// More secure approach - token is never exposed to client

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";
import { getArcGISConfig } from "@/lib/arcgis/config";

/**
 * GET /api/arcgis-proxy/[...path]
 * Proxies requests to ArcGIS Portal/Server with token authentication
 *
 * Usage:
 * <iframe src="/api/arcgis-proxy/apps/dashboards/118f24e23de84824ab01b0565a6050c9" />
 * <iframe src="/api/arcgis-proxy/apps/webappviewer/index.html?id=9df4b5c46b30432b98d90ddb937cffeb" />
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    // Handle both async and sync params (Next.js 13+ vs 14+)
    const resolvedParams = await Promise.resolve(params);
    const { path } = resolvedParams;
    const { searchParams } = new URL(request.url);

    // Construct the target path
    const targetPath = Array.isArray(path) ? path.join("/") : path || "";

    // Get ArcGIS Portal configuration
    const arcgisConfig = getArcGISConfig();
    const portalUrl = arcgisConfig.portalUrl;

    // Get or generate token
    const tokenData = await getValidToken();
    const token = tokenData.token;

    // Construct target URL
    // Remove /api/arcgis-proxy from the path
    const targetUrl = `${portalUrl}/${targetPath}`;

    // Build URL with existing query params and add token
    const url = new URL(targetUrl);

    // Copy existing query parameters
    searchParams.forEach((value, key) => {
      if (key !== "path") {
        url.searchParams.set(key, value);
      }
    });

    // Add token parameter
    url.searchParams.set("token", token);

    // Add redirect=false to prevent login redirect
    url.searchParams.set("redirect", "false");

    // Forward request to ArcGIS Portal
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Next.js ArcGIS Proxy",
        "Referer": request.headers.get("referer") || arcgisConfig.referer || "http://localhost:3000",
      },
    });

    // Check if response is OK
    if (!response.ok) {
      console.error(`❌ ArcGIS Proxy Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          error: `Failed to fetch from ArcGIS Portal: ${response.status} ${response.statusText}`,
          url: url.toString().replace(token, "***"),
        },
        { status: response.status }
      );
    }

    // Get content type
    const contentType = response.headers.get("content-type") || "text/html";

    // Get response body
    const body = await response.arrayBuffer();

    // Create response with proper headers
    const proxyResponse = new NextResponse(Buffer.from(body), {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        // Allow iframe embedding
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
        // Cache control
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });

    // Copy relevant headers from ArcGIS response
    const headersToForward = [
      "content-encoding",
      "content-length",
      "last-modified",
      "etag",
    ];

    headersToForward.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        proxyResponse.headers.set(header, value);
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error("❌ Error in ArcGIS Proxy:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to proxy ArcGIS request",
      },
      { status: 500 }
    );
  }
}

// Support POST requests for forms and other operations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    // Handle both async and sync params (Next.js 13+ vs 14+)
    const resolvedParams = await Promise.resolve(params);
    const { path } = resolvedParams;
    const { searchParams } = new URL(request.url);

    // Construct the target path
    const targetPath = Array.isArray(path) ? path.join("/") : path || "";

    // Get ArcGIS Portal configuration
    const arcgisConfig = getArcGISConfig();
    const portalUrl = arcgisConfig.portalUrl;

    // Get or generate token
    const tokenData = await getValidToken();
    const token = tokenData.token;

    // Construct target URL
    const targetUrl = `${portalUrl}/${targetPath}`;

    // Build URL with existing query params and add token
    const url = new URL(targetUrl);

    // Copy existing query parameters
    searchParams.forEach((value, key) => {
      if (key !== "path") {
        url.searchParams.set(key, value);
      }
    });

    // Add token parameter
    url.searchParams.set("token", token);
    url.searchParams.set("redirect", "false");

    // Get request body if any
    const body = await request.text();

    // Forward request to ArcGIS Portal
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/x-www-form-urlencoded",
        "User-Agent": request.headers.get("user-agent") || "Next.js ArcGIS Proxy",
        "Referer": request.headers.get("referer") || arcgisConfig.referer || "http://localhost:3000",
      },
      body: body || undefined,
    });

    // Get response
    const responseBody = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/json";

    return new NextResponse(Buffer.from(responseBody), {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
      },
    });
  } catch (error) {
    console.error("❌ Error in ArcGIS Proxy POST:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to proxy ArcGIS POST request",
      },
      { status: 500 }
    );
  }
}

