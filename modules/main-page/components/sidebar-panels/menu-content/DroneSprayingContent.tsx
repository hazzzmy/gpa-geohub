"use client";

import React from "react";
import { Plane, Calendar, Droplets, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DroneSprayingContentProps {
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
}

export function DroneSprayingContent({ landUnit }: DroneSprayingContentProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-blue-100 dark:bg-blue-900">
          <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Drone Insecticide Spraying</h3>
          <p className="text-sm text-muted-foreground">
            Spraying data for {landUnit.name}
          </p>
        </div>
      </div>

      {/* Content Cards */}
      
    </div>
  );
}





