import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const LAND_DEVELOPMENT_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Development/Land_Development/FeatureServer/17/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('task_type'); // Optional filter by task_type

    // Build where clause
    let whereClause = "1=1";
    if (taskType) {
      whereClause = `task_type='${taskType}'`;
    }

    const queryParams = new URLSearchParams({
      where: whereClause,
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

    const url = `${LAND_DEVELOPMENT_LAYER_URL}?${queryParams.toString()}`;

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

    console.log("🔍 Land Development Monthly Data:", JSON.stringify(data, null, 2));

    // Process features to extract monthly data
    const features = data.features || [];
    const monthlyStats: Record<string, {
      month: string; // Format: "YYYY-MM"
      year: number;
      monthNumber: number;
      totalArea: number;
      taskTypes: Record<string, {
        totalArea: number;
        farms: Record<string, number>;
      }>;
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
      const taskType = feature.attributes?.task_type || "Unknown";
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
          taskTypes: {},
        };
      }
      
      // Initialize task type entry if not exists
      if (!monthlyStats[monthKey].taskTypes[taskType]) {
        monthlyStats[monthKey].taskTypes[taskType] = {
          totalArea: 0,
          farms: {},
        };
      }
      
      // Add to totals
      monthlyStats[monthKey].totalArea += area;
      monthlyStats[monthKey].taskTypes[taskType].totalArea += area;
      
      if (farmName) {
        monthlyStats[monthKey].taskTypes[taskType].farms[farmName] = 
          (monthlyStats[monthKey].taskTypes[taskType].farms[farmName] || 0) + area;
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

    console.log("🔍 Monthly Stats:", monthlyCumulative);

    return NextResponse.json({
      success: true,
      monthly: monthlyCumulative,
      taskType: taskType || null, // Return filter if applied
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Land Development Monthly API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch land development monthly statistics",
      },
      { status: 500 },
    );
  }
}


