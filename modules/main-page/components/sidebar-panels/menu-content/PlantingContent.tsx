"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Calendar, MapPin, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlantingContentProps {
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
}

export function PlantingContent({ landUnit }: PlantingContentProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  });

  // Fetch planted data for rotation 0
  const { data: rotation0Data, isLoading: rotation0Loading, error: rotation0Error } = useQuery({
    queryKey: ['planted-rotation-0', landUnit.fid_1],
    queryFn: async () => {
      const response = await fetch('/api/planted/0');
      if (!response.ok) {
        throw new Error('Failed to fetch rotation 0 data');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    enabled: !!landUnit.fid_1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch planted data for rotation 1
  const { data: rotation1Data, isLoading: rotation1Loading, error: rotation1Error } = useQuery({
    queryKey: ['planted-rotation-1', landUnit.fid_1],
    queryFn: async () => {
      const response = await fetch('/api/planted/1');
      if (!response.ok) {
        throw new Error('Failed to fetch rotation 1 data');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    enabled: !!landUnit.fid_1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = rotation0Loading || rotation1Loading;
  const hasError = rotation0Error || rotation1Error;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-green-100 dark:bg-green-900">
          <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Planting Information</h3>
          <p className="text-sm text-muted-foreground">
            Planting data for {landUnit.name}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>Error loading planting data</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rotation 0 Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Rotation 0
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Area:</span>
                <Badge variant="secondary">
                  {rotation0Data?.totalArea ? `${formatter.format(rotation0Data.totalArea)} Ha` : '0 Ha'}
                </Badge>
              </div>
              {rotation0Data?.farms && Object.keys(rotation0Data.farms).length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">By Farm:</p>
                  <div className="space-y-1">
                    {Object.entries(rotation0Data.farms).map(([farm, area]) => (
                      <div key={farm} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{farm}:</span>
                        <span className="font-medium">{formatter.format(area)} Ha</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rotation 1 Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Rotation 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Area:</span>
                <Badge variant="secondary">
                  {rotation1Data?.totalArea ? `${formatter.format(rotation1Data.totalArea)} Ha` : '0 Ha'}
                </Badge>
              </div>
              {rotation1Data?.farms && Object.keys(rotation1Data.farms).length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">By Farm:</p>
                  <div className="space-y-1">
                    {Object.entries(rotation1Data.farms).map(([farm, area]) => (
                      <div key={farm} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{farm}:</span>
                        <span className="font-medium">{formatter.format(area)} Ha</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Rotation 0:</span>
                  <p className="font-medium">
                    {rotation0Data?.totalArea ? `${formatter.format(rotation0Data.totalArea)} Ha` : '0 Ha'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rotation 1:</span>
                  <p className="font-medium">
                    {rotation1Data?.totalArea ? `${formatter.format(rotation1Data.totalArea)} Ha` : '0 Ha'}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <span className="text-muted-foreground">Total Planted:</span>
                  <p className="font-medium text-lg">
                    {formatter.format((rotation0Data?.totalArea || 0) + (rotation1Data?.totalArea || 0))} Ha
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
