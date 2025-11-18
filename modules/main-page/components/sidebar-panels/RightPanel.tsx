"use client";

import React from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  PlantingContent,
  GapDetectionContent,
  CropEstablishmentContent,
  SoilSurveyContent,
  DroneSprayingContent,
} from "./menu-content";

interface RightPanelProps {
  selectedMenu: string | null;
  landUnit: {
    name: string;
    fid_1?: string;
    area_ha?: number;
  };
  onClose: () => void;
}

const menuContentMap = {
  planting: PlantingContent,
  "gap-detection": GapDetectionContent,
  "crop-establishment": CropEstablishmentContent,
  "soil-survey": SoilSurveyContent,
  "drone-spraying": DroneSprayingContent,
} as const;

export function RightPanel({ selectedMenu, landUnit, onClose }: RightPanelProps) {
  console.log("RightPanel rendered with:", { selectedMenu, landUnit });
  
  if (!selectedMenu) return null;

  const ContentComponent = menuContentMap[selectedMenu as keyof typeof menuContentMap];

  if (!ContentComponent) {
    return (
      <div className="w-80 h-full bg-background border-l border-border flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Content not found</p>
          <button
            onClick={onClose}
            className="text-sm text-primary hover:underline mt-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-[93vh] bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <h3 className="text-sm font-medium">Activity Details</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <ContentComponent landUnit={landUnit} />
      </div>
    </div>
  );
}
