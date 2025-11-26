import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

// Planted Area Layer for task_date
const PLANTED_AREA_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/FeatureServer/7/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();

    // Get task_type from query parameters (optional for planted)
    const { searchParams } = new URL(request.url);

    // Build where clause based on task_type parameter
    const whereClause = "1=1";

    const queryParams = new URLSearchParams({
      where: whereClause,
      outFields: "plant_date",
      returnGeometry: "false",
      outStatistics: JSON.stringify([
        {
          statisticType: "max",
          onStatisticField: "plant_date",
          outStatisticFieldName: "max_plant_date",
        },
      ]),
      f: "json",
      token: token.token,
    });

    const url = `${PLANTED_AREA_URL}?${queryParams.toString()}`;
    console.log('latest-plant-date', url)

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

    // Extract the max plant_date from the statistics result
    const features = data.features || [];
    const maxPlantDate = features[0]?.attributes?.max_plant_date;

    if (!maxPlantDate) {
      return NextResponse.json({
        success: true,
        latestDate: null,
      });
    }

    // ArcGIS returns dates as Unix timestamp (milliseconds)
    const date = new Date(maxPlantDate);

    return NextResponse.json({
      success: true,
      latestDate: date.toISOString(),
      timestamp: maxPlantDate,
    });
  } catch (error) {
    console.error("❌ Planted Area latest date error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch latest planted date",
      },
      { status: 500 },
    );
  }
}

