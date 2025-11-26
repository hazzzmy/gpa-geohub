import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_PREPARATION_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Preparation/Land_Preparation/FeatureServer/7/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();

    const queryParams = new URLSearchParams({
      where: "1=1",
      outFields: "farm",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm",
      outStatistics: JSON.stringify([
        {
          statisticType: "SUM",
          onStatisticField: "area_ha",
          outStatisticFieldName: "sum_area_ha",
        },
      ]),
      f: "json",
      token: token.token,
    });

    const url = `${LAND_PREPARATION_LAYER_URL}?${queryParams.toString()}`;

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
      totalArea,
      farms: farmStats,
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Land Preparation stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch land preparation statistics",
      },
      { status: 500 },
    );
  }
}

