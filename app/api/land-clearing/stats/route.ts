import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_CLEARING_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer/7/query";

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
          onStatisticField: "Area_Ha",
          outStatisticFieldName: "sum_area_ha",
        },
      ]),
      f: "json",
      token: token.token,
    });

    const url = `${LAND_CLEARING_LAYER_URL}?${queryParams.toString()}`;

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
    console.error("❌ Land Clearing stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch land clearing statistics",
      },
      { status: 500 },
    );
  }
}

