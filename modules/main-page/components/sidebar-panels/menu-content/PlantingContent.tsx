"use client";

import React from "react";
import { Sprout, Calendar, MapPin, BarChart3 } from "lucide-react";
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
{/* 
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Planting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Planned Date:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Actual Date:</span>
                <p className="font-medium">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Planting Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Crop Type:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Variety:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Planting Method:</span>
                <p className="font-medium">-</p>
              </div>
              <div>
                <span className="text-muted-foreground">Seed Rate:</span>
                <p className="font-medium">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Area Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Area:</span>
              <Badge variant="secondary">
                {landUnit.area_ha ? `${landUnit.area_ha.toFixed(2)} Ha` : 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
