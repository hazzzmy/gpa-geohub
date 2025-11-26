import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

// Land Development Progress Layer for task_date
const LAND_DEVELOPMENT_PROGRESS_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Development/Land_Development/FeatureServer/17/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();

    // Get task_type from query parameters
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('task_type');

    // Build where clause based on task_type parameter
    const whereClause = taskType ? `task_type = '${taskType}'` : "1=1";

    const queryParams = new URLSearchParams({
      where: whereClause,
      outFields: "task_date",
      returnGeometry: "false",
      outStatistics: JSON.stringify([
        {
          statisticType: "max",
          onStatisticField: "task_date",
          outStatisticFieldName: "max_task_date",
        },
      ]),
      f: "json",
      token: token.token,
    });

    const url = `${LAND_DEVELOPMENT_PROGRESS_URL}?${queryParams.toString()}`;
    console.log('🔍 Land Development latest-date URL:', url);
    console.log('🔍 Task Type:', taskType);
    console.log('🔍 Where Clause:', whereClause);

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

    // Extract the max task_date from the statistics result
    const features = data.features || [];
    const maxTaskDate = features[0]?.attributes?.max_task_date;

    if (!maxTaskDate) {
      return NextResponse.json({
        success: true,
        latestDate: null,
      });
    }

    // ArcGIS returns dates as Unix timestamp (milliseconds)
    const date = new Date(maxTaskDate);

    return NextResponse.json({
      success: true,
      latestDate: date.toISOString(),
      timestamp: maxTaskDate,
    });
  } catch (error) {
    console.error("❌ Land Development latest date error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch latest land development date",
      },
      { status: 500 },
    );
  }
}

