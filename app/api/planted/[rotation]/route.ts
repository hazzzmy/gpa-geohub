import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const PLANTED_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/FeatureServer/3/query";

export async function GET(
  _request: NextRequest,
  { params }: { params: { rotation: string } }
) {
  try {
    const token = await getValidToken();
    const rotation = decodeURIComponent(params.rotation);

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

    console.log(`🔍 Planted Rotation ${rotation} Data:`, JSON.stringify(data, null, 2));

    // Process features to extract farm data
    const features = data.features || [];
    const farmStats: Record<string, number> = {};
    let totalArea = 0;

    features.forEach((feature: { 
      attributes?: { 
        farm?: string; 
        sum_area_ha?: number; 
        sum_Area_Ha?: number;
      } 
    }) => {
      const farmName = feature.attributes?.farm;
      // Try both field name variations
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      
      if (farmName) {
        farmStats[farmName] = area;
      }
      totalArea += area;
    });

    console.log(`🔍 Planted Rotation ${rotation} Farm Stats:`, farmStats);
    console.log(`🔍 Total Planted Rotation ${rotation} Area:`, totalArea);

    return NextResponse.json({
      success: true,
      rotation,
      totalArea,
      farms: farmStats,
      rawFeatures: features,
    });
  } catch (error) {
    const rotation = params?.rotation || 'unknown';
    console.error(`❌ Planted Rotation ${rotation} API error:`, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : `Failed to fetch planted rotation ${rotation} statistics`,
      },
      { status: 500 },
    );
  }
}


