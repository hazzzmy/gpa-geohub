import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_CLEARING_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer/8/query";

export async function GET(
  _request: NextRequest,
  { params }: { params: { task_type: string } }
) {
  try {
    const token = await getValidToken();
    const taskType = decodeURIComponent(params.task_type);

    const queryParams = new URLSearchParams({
      where: `task_type='${taskType}'`,
      outFields: "farm, task_type, task_date",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm, task_type, task_date",
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

    console.log(`🔍 Land Clearing Monthly ${taskType} Data:`, JSON.stringify(data, null, 2));

    // Process features to extract monthly data
    const features = data.features || [];
    const monthlyStats: Record<string, {
      month: string; // Format: "YYYY-MM"
      year: number;
      monthNumber: number;
      totalArea: number;
      farms: Record<string, number>;
    }> = {};

    features.forEach((feature: { 
      attributes?: { 
        farm?: string; 
        task_type?: string;
        task_date?: number; // ArcGIS date is usually in milliseconds
        sum_area_ha?: number; 
        sum_Area_Ha?: number;
      } 
    }) => {
      const farmName = feature.attributes?.farm;
      const taskDate = feature.attributes?.task_date;
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      
      if (!taskDate) {
        console.warn("⚠️ Missing task_date for feature:", feature);
        return;
      }

      // Convert ArcGIS date to Date object
      // ArcGIS dates can be in milliseconds or other formats
      let date: Date;
      if (typeof taskDate === 'number') {
        // If it's a number, assume it's milliseconds (or might need to multiply by 1000 if in seconds)
        date = new Date(taskDate > 1000000000000 ? taskDate : taskDate * 1000);
      } else if (typeof taskDate === 'string') {
        date = new Date(taskDate);
      } else {
        console.warn("⚠️ Invalid task_date format:", taskDate);
        return;
      }

      // Validate date
      if (isNaN(date.getTime())) {
        console.warn("⚠️ Invalid date:", taskDate);
        return;
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const monthKey = `${year}-${String(month).padStart(2, '0')}`; // Format: "YYYY-MM"
      
      // Initialize month entry if not exists
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          year,
          monthNumber: month,
          totalArea: 0,
          farms: {},
        };
      }
      
      // Add to totals
      monthlyStats[monthKey].totalArea += area;
      
      if (farmName) {
        monthlyStats[monthKey].farms[farmName] = 
          (monthlyStats[monthKey].farms[farmName] || 0) + area;
      }
    });

    // Convert to array and sort by date
    const monthlyArray = Object.values(monthlyStats).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNumber - b.monthNumber;
    });

    // Calculate cumulative totals
    let cumulativeTotal = 0;
    const monthlyCumulative = monthlyArray.map((monthData) => {
      cumulativeTotal += monthData.totalArea;
      return {
        ...monthData,
        cumulativeTotal,
      };
    });

    console.log(`🔍 Monthly ${taskType} Stats:`, monthlyCumulative);

    return NextResponse.json({
      success: true,
      taskType: taskType,
      monthly: monthlyCumulative,
      rawFeatures: features,
    });
  } catch (error) {
    const taskType = params?.task_type || 'unknown';
    console.error(`❌ Land Clearing Monthly ${taskType} API error:`, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : `Failed to fetch ${taskType} monthly statistics`,
      },
      { status: 500 },
    );
  }
}

