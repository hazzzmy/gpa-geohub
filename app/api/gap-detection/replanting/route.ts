import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/arcgis/config";

const GAP_DETECTION_LAYER_URL =
  "https://geoportal.mnmsugarhub.com/server/rest/services/Gap_Detection/MapServer/2/query";

function escapeValue(value: string) {
  return value.replace(/'/g, "''");
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get("fid");
    const filters = searchParams.getAll("filter");

    const conditions: string[] = [];

    if (fid) {
      conditions.push(`fid_1 = '${escapeValue(fid)}'`);
    }

    filters.forEach((filterParam) => {
      const [rawField, ...rawValueParts] = filterParam.split(":");
      const value = rawValueParts.join(":");
      if (!rawField || !value) {
        return;
      }

      const field = rawField.trim();
      const trimmedValue = value.trim();
      if (!field || !trimmedValue) {
        return;
      }

      conditions.push(`${field} = '${escapeValue(trimmedValue)}'`);
    });

    const whereClause = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

    const token = await getValidToken();

    const queryParams = new URLSearchParams({
      where: whereClause,
      returnGeometry: "false",
      returnCountOnly: "false",
      returnIdsOnly: "false",
      f: "json",
      outStatistics: JSON.stringify([
        {
          statisticType: "sum",
          onStatisticField: "replanting",
          outStatisticFieldName: "total_replanting",
        },
        {
          statisticType: "count",
          onStatisticField: "replanting",
          outStatisticFieldName: "replanting_count",
        },
      ]),
      token: token.token,
    });

    const url = `${GAP_DETECTION_LAYER_URL}?${queryParams.toString()}`;

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

    const attributes = data.features?.[0]?.attributes ?? {};
    const total =
      attributes?.total_replanting ?? 0;
    const count =
      attributes?.replanting_count ?? 0;

    return NextResponse.json({
      success: true,
      fid,
      totalReplanting: total,
      recordCount: count,
      where: whereClause,
    });
  } catch (error) {
    console.error("❌ Gap Detection replanting metric error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch replanting metric",
      },
      { status: 500 },
    );
  }
}


