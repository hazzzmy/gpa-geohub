"use client";

import React from "react";
import { Mountain, TestTube, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SoilSurveyContentProps {
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
}

export function SoilSurveyContent({ landUnit }: SoilSurveyContentProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-amber-100 dark:bg-amber-900">
          <Mountain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Soil Survey</h3>
          <p className="text-sm text-muted-foreground">
            Soil analysis for {landUnit.name}
          </p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        {/* Soil Properties */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Soil Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">pH Level:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Organic Matter:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nitrogen (N):</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phosphorus (P):</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Potassium (K):</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Soil Type:</span>
                <Badge variant="outline">-</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soil Moisture */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Soil Moisture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Surface Moisture:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Deep Moisture:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Drainage:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Water Holding:</span>
                <p className="font-medium">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Survey Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Survey Date:</span>
              <p className="font-medium">-</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Surveyor:</span>
              <p className="font-medium">-</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Sample Depth:</span>
              <p className="font-medium">-</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Recommendations:</span>
              <p className="font-medium">-</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





