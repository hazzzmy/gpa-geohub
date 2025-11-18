"use client";

import React from "react";
import { Leaf, Calendar, Thermometer, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CropEstablishmentContentProps {
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
}

export function CropEstablishmentContent({ landUnit }: CropEstablishmentContentProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-900">
          <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Crop Establishment & Germination</h3>
          <p className="text-sm text-muted-foreground">
            Growth status for {landUnit.name}
          </p>
        </div>
      </div>

      {/* Content Cards */}
    </div>
  );
}

