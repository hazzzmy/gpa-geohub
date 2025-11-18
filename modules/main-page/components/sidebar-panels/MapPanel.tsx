"use client";

import React, { useState } from "react";
import { Map, Layers, Eye, EyeOff, Search, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MapPanelProps {
  user?: {
    name: string;
    email: string;
  };
  onActionClick?: (actionId: string) => void;
}

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  icon: React.ComponentType<any>;
}

export function MapPanel({ user, onActionClick }: MapPanelProps) {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "satellite",
      name: "Satellite Imagery",
      type: "Base Layer",
      visible: true,
      icon: Map,
    },
    {
      id: "boundaries",
      name: "Administrative Boundaries",
      type: "Vector",
      visible: true,
      icon: MapPin,
    },
    {
      id: "field-data",
      name: "Field Data Points",
      type: "Feature",
      visible: false,
      icon: Layers,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const toggleLayer = (layerId: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const visibleLayers = layers.filter((layer) => layer.visible).length;
  const totalLayers = layers.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-foreground mb-1">
          Map Controls
        </h3>
        <p className="text-xs text-muted-foreground">
          {visibleLayers} of {totalLayers} layers visible
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              Layers
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                const allVisible = layers.every((l) => l.visible);
                setLayers(
                  layers.map((l) => ({ ...l, visible: !allVisible }))
                );
              }}
            >
              {layers.every((l) => l.visible) ? "Hide All" : "Show All"}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <layer.icon className="w-4 h-4 text-sidebar-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {layer.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {layer.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {layer.visible ? (
                    <Eye className="w-4 h-4 text-sidebar-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => toggleLayer(layer.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={() => onActionClick?.("add-layer")}
          >
            <Layers className="w-3 h-3 mr-1" />
            Add Layer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={() => onActionClick?.("zoom-extent")}
          >
            <Map className="w-3 h-3 mr-1" />
            Zoom Extent
          </Button>
        </div>
      </div>
    </div>
  );
}


