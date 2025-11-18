import { NextRequest, NextResponse } from "next/server";
import {
  isValidLevel,
  buildQueryUrl,
  buildWhereClause,
  validateFilters,
  LandUnitFilters,
  LandUnitLevel,
  LAYER_CONFIG,
} from "@/lib/arcgis/landunit-config";
import { getValidToken } from "@/lib/arcgis/config";

/**
 * GET /api/landunit/[level]
 * 
 * Query land units by level with optional hierarchical filtering
 * 
 * Examples:
 * - GET /api/landunit/pu - Get all pus
 * - GET /api/landunit/region?pu=Jagebob pu - Get regions for specific pu
 * - GET /api/landunit/farm?pu=X&region=Y - Get farms with pu and region filters
 * - GET /api/landunit/block?farm=Z - Get blocks for specific farm
 * - GET /api/landunit/paddock?block=B1 - Get paddocks for specific block
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Validate level
    if (!isValidLevel(level)) {
      return NextResponse.json(
        {
          error: "Invalid level",
          message: `Level must be one of: pu, region, farm, block, paddock`,
          validLevels: ["pu", "region", "farm", "block", "paddock"],
        },
        { status: 400 }
      );
    }

    // Build filters from query params
    const filters: LandUnitFilters = {
      pu: searchParams.get("pu") || undefined,
      region: searchParams.get("region") || undefined,
      farm: searchParams.get("farm") || undefined,
      block: searchParams.get("block") || undefined,
      paddock: searchParams.get("paddock") || undefined,
    };

    // Validate filters
    const validation = validateFilters(level, filters);
    
    // Get ArcGIS token
    const token = await getValidToken();
    if (!token) {
      return NextResponse.json(
        { error: "Failed to get ArcGIS token" },
        { status: 500 }
      );
    }

    // Build query URL and WHERE clause
    const queryUrl = buildQueryUrl(level);
    const whereClause = buildWhereClause(filters, level);
    const config = LAYER_CONFIG[level];

    // Query parameters for ArcGIS REST API
    const queryParams = new URLSearchParams({
      where: whereClause,
      outFields: "*",
      returnGeometry: "false",
      returnTrueCurves: "false",
      returnIdsOnly: "false",
      returnCountOnly: "false",
      returnZ: "false",
      returnM: "false",
      returnDistinctValues: "false",
      f: "json",
      token: token.token,
    });

    const fullUrl = `${queryUrl}?${queryParams.toString()}`;

    console.log(`🔍 Querying ${level}:`, {
      url: queryUrl,
      where: whereClause,
      filters,
    });

    // Fetch from ArcGIS MapServer
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ArcGIS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle ArcGIS errors
    if (data.error) {
      console.error(`❌ ArcGIS Error for ${level}:`, data.error);
      return NextResponse.json(
        {
          error: "ArcGIS API Error",
          message: data.error.message,
          code: data.error.code,
          details: data.error.details,
        },
        { status: 400 }
      );
    }

    // Transform features to simplified format
    const features = data.features || [];
    const items = features.map((feature: any) => ({
      id: feature.attributes[config.idField],
      name: feature.attributes[config.nameField],
      ...feature.attributes, // Include all attributes
    }));

    console.log(`✅ Found ${items.length} ${level}(s)`);

    // Return response with metadata
    return NextResponse.json({
      success: true,
      level,
      count: items.length,
      filters,
      warning: validation.message,
      data: items,
      metadata: {
        layerId: config.layerId,
        nameField: config.nameField,
        idField: config.idField,
        whereClause,
      },
    });

  } catch (error) {
    console.error("❌ Error in landunit API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

