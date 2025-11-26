import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const PLANTED_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/FeatureServer/3/query";

export async function GET(_request: NextRequest) {
  try {
    const token = await getValidToken();

    // Query for both rotation 0 and rotation 1
    const queryParams = new URLSearchParams({
      where: "1=1", // Get all rotations
      outFields: "farm, rotation",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm, rotation",
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

    console.log("🔍 Planted All Data (with rotations):", JSON.stringify(data, null, 2));

    // Process features to extract farm data by rotation
    const features = data.features || [];
    const rotations: Record<string, {
      totalArea: number;
      farms: Record<string, number>;
    }> = {};

    features.forEach((feature: { 
      attributes?: { 
        farm?: string;
        rotation?: string | number;
        sum_area_ha?: number; 
        sum_Area_Ha?: number;
      } 
    }) => {
      const farmName = feature.attributes?.farm;
      const rotation = String(feature.attributes?.rotation ?? '0');
      // Try both field name variations
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      
      if (!rotations[rotation]) {
        rotations[rotation] = {
          totalArea: 0,
          farms: {},
        };
      }
      
      if (farmName) {
        rotations[rotation].farms[farmName] = (rotations[rotation].farms[farmName] || 0) + area;
      }
      rotations[rotation].totalArea += area;
    });

    console.log("🔍 Planted Rotations:", rotations);

    // Return structure with rotations
    return NextResponse.json({
      success: true,
      rotations,
      // For backward compatibility, also return rotation 0 data as default
      totalArea: rotations['0']?.totalArea || 0,
      farms: rotations['0']?.farms || {},
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Planted API error:", error);
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

