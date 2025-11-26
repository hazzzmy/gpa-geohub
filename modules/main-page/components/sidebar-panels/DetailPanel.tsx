"use client";

import React, { useState } from "react";
import { SelectedNode } from "@/components/landunit";
import { X, Sprout, BarChart3, Leaf, Mountain, Plane, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RightPanel } from "./RightPanel";

interface DetailPanelProps {
  node: SelectedNode;
  onClose: () => void;
  onMenuSelect?: (menuId: string) => void;
}

interface MenuCard {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
}

const menuCards: MenuCard[] = [
  {
    id: "planting",
    title: "Planting",
    icon: Sprout,
    color: "text-green-600 dark:text-green-400",
  },
  {
    id: "gap-detection",
    title: "Gap Detections Analysis",
    icon: BarChart3,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "Weed Detection",
    title: "Weed Detection",
    icon: Leaf,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "soil-survey",
    title: "Soil Survey",
    icon: Mountain,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "spraying",
    title: "Spraying Analysis",
    icon: Plane,
    color: "text-blue-600 dark:text-blue-400",
  },
];

export function DetailPanel({ node, onClose, onMenuSelect }: DetailPanelProps) {
  const { item, level, filters } = node;
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  // Debug: Log all available fields
  console.log("Available fields in item:", Object.keys(item));
  console.log("Area fields:", Object.keys(item).filter(key => 
    key.toLowerCase().includes('area') || 
    key.toLowerCase().includes('ha') || 
    key.toLowerCase().includes('hectare') ||
    key.includes('expression')
  ));
  console.log("Expression area_ha value:", item['expression/area_ha']);

  const handleMenuClick = (menuId: string) => {
    setSelectedMenu(menuId);
    if (onMenuSelect) {
      onMenuSelect(menuId);
    }
    
    // Dispatch custom event for MainLayoutWithRightPanel
    const event = new CustomEvent('menuSelect', { 
      detail: { menuId } 
    });
    window.dispatchEvent(event);
    console.log("DetailPanel dispatched menuSelect event:", { menuId });
    
    console.log("Menu clicked:", menuId);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Land Unit Details</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {level.charAt(0).toUpperCase() + level.slice(1)} Information
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Info Card */}
      <Card className="p-4 rounded">
        <div className="flex gap-3 flex-col">
          {/* Name */}
          <div className="flex items-center gap-2 text-sm w-full justify-between">
            <span className="text-muted-foreground capitalize">{level} Name</span>
            <span className="font-semibold">{item.name}</span>
          </div>

          {/* FID */}
          {item.fid_1 && (
            <div className="flex items-center gap-2 text-xs w-full justify-between">
              <span className="text-muted-foreground">FID</span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {item.fid_1}
              </span>
            </div>
          )}

          {/* Area Ha */}
          <div className="flex items-center gap-2 text-xs w-full justify-between">
            <span className="text-muted-foreground">Area (Ha)</span>
            <span className="font-medium">
              {(() => {
                // Try different possible field names for area
                const areaFields = [
                  'st_area(shape)',
                ];
                for (const field of areaFields) {
                  if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
                    return `${(item[field] / 10000).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} Ha`;
                  }
                }
                return '0.00 Ha';
              })()}
            </span>
          </div>

          {/* Filters */}
          {Object.keys(filters).length > 0 && (
            <>
              <div className="border-t pt-3" />
              <div className="space-y-1">
                {Object.entries(filters).map(([key, value]) => {
                  if (value) {
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs w-full justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace('_id', '')}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </>
          )}
            </div>
      </Card>

      {/* Activity Menu Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Activity & Analysis
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {menuCards.map((menu) => {
            const Icon = menu.icon;
            const isSelected = selectedMenu === menu.id;
            
            return (
              <Card
                key={menu.id}
                className={`p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                  isSelected ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleMenuClick(menu.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-accent ${menu.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium truncate">{menu.title}</h5>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

