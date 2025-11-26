import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_CLEARING_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer/8/query";

export async function GET(_request: NextRequest) {
  try {
    const token = await getValidToken();

    const queryParams = new URLSearchParams({
      where: "1=1",
      outFields: "farm, task_type",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm, task_type",
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

    console.log("🔍 Land Clearing All Task Types Data:", JSON.stringify(data, null, 2));

    const taskTypeStats: Record<string, {
      totalArea: number;
      farms: Record<string, number>;
    }> = {};

    const features = data.features || [];
    console.log("🔍 Features count:", features.length);

    features.forEach((feature: { 
      attributes?: { 
        farm?: string; 
        task_type?: string;
        sum_area_ha?: number; 
        sum_Area_Ha?: number;
      } 
    }) => {
      const farmName = feature.attributes?.farm;
      const taskType = feature.attributes?.task_type || "Unknown";
      // Try both field name variations
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      
      if (!taskTypeStats[taskType]) {
        taskTypeStats[taskType] = {
          totalArea: 0,
          farms: {},
        };
      }
      
      if (farmName) {
        taskTypeStats[taskType].farms[farmName] = area;
      }
      taskTypeStats[taskType].totalArea += area;
    });

    console.log("🔍 Task Type Stats:", taskTypeStats);

    return NextResponse.json({
      success: true,
      taskTypes: taskTypeStats,
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Land Clearing All Task Types API error:", error);
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


