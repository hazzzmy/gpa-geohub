import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const PLANTED_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/FeatureServer/3/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();
    const { searchParams } = new URL(request.url);
    const rotation = searchParams.get('rotation') || '0'; // Default to rotation 0

    // Validate rotation value
    if (rotation !== '0' && rotation !== '1') {
      return NextResponse.json(
        {
          success: false,
          error: "Rotation must be '0' or '1'",
        },
        { status: 400 },
      );
    }

    const queryParams = new URLSearchParams({
      where: `rotation='${rotation}'`,
      outFields: "farm",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm",
      outStatistics: JSON.stringify([
        {
          statisticType: "SUM",
          onStatisticField: "Area_Ha",
          outStatisticFieldName: "sum_area_ha",
        },
      ]),
      f: "json",
      token: token.token,
    });

    const url = `${PLANTED_LAYER_URL}?${queryParams.toString()}`;

    console.log(`🔍 Planted Stats URL (rotation=${rotation}):`, url);

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ArcGIS request failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `ArcGIS error: ${data.error.message || "Unknown error"} (code: ${data.error.code})`,
      );
    }

    // Process features to extract farm data
    const features = data.features || [];
    const farmStats: Record<string, number> = {};
    let totalArea = 0;

    features.forEach((feature: any) => {
      const farm = feature.attributes?.farm || "Unknown";
      const area = feature.attributes?.sum_area_ha || 0;
      farmStats[farm] = area;
      totalArea += area;
    });

    return NextResponse.json({
      success: true,
      rotation,
      totalArea,
      farms: farmStats,
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Planted stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch planted statistics",
      },
      { status: 500 },
    );
  }
}

