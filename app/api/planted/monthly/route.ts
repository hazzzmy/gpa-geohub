import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const PLANTED_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/FeatureServer/3/query";

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();
    const { searchParams } = new URL(request.url);
    const rotation = searchParams.get('rotation') || '0'; // Default to rotation 0

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
      outFields: "farm, plant_date",
      returnGeometry: "false",
      groupByFieldsForStatistics: "farm, plant_date",
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

    console.log("🔍 Planted Monthly Data:", JSON.stringify(data, null, 2));

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
        plant_date?: number; // ArcGIS date is usually in milliseconds
        sum_area_ha?: number; 
        sum_Area_Ha?: number;
      } 
    }) => {
      const farmName = feature.attributes?.farm;
      const plantingDate = feature.attributes?.plant_date;
      const area = feature.attributes?.sum_area_ha || feature.attributes?.sum_Area_Ha || 0;
      
      if (!plantingDate) {
        console.warn("⚠️ Missing planting_date for feature:", feature);
        return;
      }

      // Convert ArcGIS date to Date object
      // ArcGIS dates can be in milliseconds or other formats
      let date: Date;
      if (typeof plantingDate === 'number') {
        // If it's a number, assume it's milliseconds (or might need to multiply by 1000 if in seconds)
        date = new Date(plantingDate > 1000000000000 ? plantingDate : plantingDate * 1000);
      } else if (typeof plantingDate === 'string') {
        date = new Date(plantingDate);
      } else {
        console.warn("⚠️ Invalid planting_date format:", plantingDate);
        return;
      }

      // Validate date
      if (isNaN(date.getTime())) {
        console.warn("⚠️ Invalid date:", plantingDate);
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

    console.log(`🔍 Monthly Stats (rotation=${rotation}):`, monthlyCumulative);

    return NextResponse.json({
      success: true,
      rotation,
      monthly: monthlyCumulative,
      rawFeatures: features,
    });
  } catch (error) {
    console.error("❌ Planted Monthly API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch planted monthly statistics",
      },
      { status: 500 },
    );
  }
}

