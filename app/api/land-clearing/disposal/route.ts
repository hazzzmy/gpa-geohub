import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_CLEARING_DISPOSAL_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer/8/query";

export async function GET(_request: NextRequest) {
  try {
    const token = await getValidToken();

    const queryParams = new URLSearchParams({
      where: "task_type='Disposal'",
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

    const url = `${LAND_CLEARING_DISPOSAL_LAYER_URL}?${queryParams.toString()}`;

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

    console.log("🔍 Land Clearing Disposal Data:", JSON.stringify(data, null, 2));

    let totalDisposal = 0;
    const farms: Record<string, number> = {};

    const features = data.features || [];
    console.log("🔍 Features count:", features.length);

    features.forEach((feature: { attributes?: { farm?: string; sum_area_ha?: number; sum_Area_Ha?: number } }) => {
      const farmName = feature.attributes?.farm;
      // Try both field name variations
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      console.log(`🔍 Farm: ${farmName}, Area: ${area}, Attributes:`, feature.attributes);
      if (farmName) {
        farms[farmName] = area;
      }
      totalDisposal += area;
    });

    console.log("🔍 Total Disposal:", totalDisposal);
    console.log("🔍 Farms:", farms);

    return NextResponse.json({
      success: true,
      totalDisposal: totalDisposal,
      farms: farms,
    });
  } catch (error) {
    console.error("❌ Land Clearing Disposal API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch disposal statistics",
      },
      { status: 500 },
    );
  }
}

