"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Label,
} from "@/components/ui/chart";

interface GapDetectionContentProps {
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
}

export function GapDetectionContent({ landUnit }: GapDetectionContentProps) {
  const fid = landUnit.fid_1 ?? null;

  const { data } = useQuery({
    queryKey: ["gap-detection-replanting", fid],
    queryFn: async () => {
      const response = await fetch(`/api/gap-detection/replanting?fid=${encodeURIComponent(fid ?? "")}`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch replanting statistics");
      }

      const payload = await response.json() as {
        success: boolean;
        fid: string;
        totalReplanting: number;
        recordCount: number;
      };

      if (!payload.success) {
        throw new Error("ArcGIS returned an error for replanting statistics");
      }

      return payload;
    },
    enabled: Boolean(fid),
    refetchOnWindowFocus: false,
  });

  const plantedArea = 18.68;
  const gapArea = 8.25;
  const plantedRate = 69.36;
  const gapRate = 30.63;

  const totalReplanting = data?.totalReplanting ?? 74286;
  const totalArea = plantedArea + gapArea;

  const chartConfig = useMemo(
    () =>
      ({
        planted: {
          label: "Planted",
          color: "#10B981", // emerald-500
        },
        gaps: {
          label: "Gaps",
          color: "#EF4444", // red-500
        },
      }) satisfies ChartConfig,
    [],
  );

  const coverageChartData = useMemo(() => {
    if (totalArea <= 0) {
      return [];
    }

    return [
      {
        key: "planted" as const,
        label: "Planted",
        value: plantedArea,
      },
      {
        key: "gaps" as const,
        label: "Gaps",
        value: gapArea,
      },
    ];
  }, [plantedArea, gapArea, totalArea]);
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-orange-100 dark:bg-orange-900">
          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Gap Detection Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Growth gap analysis for {landUnit.name}
          </p>
        </div>
      </div>


      {/* Area & Rate */}
      <div className="grid gap-3">

        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950/30 py-0">
          <CardContent className="flex flex-col gap-3 px-3 py-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              <span className="font-medium">Coverage</span>
              <span className="font-medium">100%</span>
            </div>
            <ChartContainer config={chartConfig} className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${formatter.format(Number(value))} Ha`}
                      />
                    }
                  />
                  <Pie
                    data={coverageChartData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={32}
                    outerRadius={48}
                    paddingAngle={3}
                  >
                    {coverageChartData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={chartConfig[entry.key].color}
                        stroke="transparent"
                      />
                    ))}
                    <Label
                      position="center"
                      content={() => (
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Planted
                          </span>
                          <span className="text-base font-semibold text-primary whitespace-nowrap">
                            {formatter.format(plantedRate)}%
                          </span>
                        </div>
                      )}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="flex justify-center gap-3 text-[11px] uppercase tracking-wide">
              {coverageChartData.map((segment) => (
                <div key={segment.key} className="flex items-center gap-1 whitespace-nowrap">
                  <span
                    className="inline-block size-2 rounded-sm"
                    style={{ backgroundColor: chartConfig[segment.key].color }}
                  />
                  <span className="text-muted-foreground">
                    {chartConfig[segment.key].label}:{" "}
                    <span className="font-semibold text-primary">
                      {formatter.format((segment.value / totalArea) * 100)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 py-0">
                <CardContent className="px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Planted Area
                  </p>
                  <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300 leading-tight whitespace-nowrap">
                    {formatter.format(plantedArea)} Ha
                  </p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 py-0">
                <CardContent className="px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-red-600 dark:text-red-400">
                    Gap Area
                  </p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400 leading-tight whitespace-nowrap">
                    {formatter.format(gapArea)} Ha
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col text-sm gap-2">
          <Card className="border-slate-200/70 dark:border-slate-800/80 py-0">
            <CardContent className="flex items-center justify-between px-3 py-3 space-x-6">
              <span className="text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                Aerial photo
              </span>
              <span className="text-base font-semibold text-primary whitespace-nowrap">
                7 Oct 2025
              </span>
            </CardContent>
          </Card>
          <Card className="border-slate-200/70 dark:border-slate-800/80 py-0">
            <CardContent className="flex items-center justify-between px-3 py-3 space-x-6">
              <span className="text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                Monitoring age
              </span>
              <span className="text-base font-semibold text-primary whitespace-nowrap">
                {formatter.format(26)} – {formatter.format(32)} days
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

