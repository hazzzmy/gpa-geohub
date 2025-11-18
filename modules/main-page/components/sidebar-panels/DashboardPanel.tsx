"use client";

import React, { useState } from "react";
import { LandUnitTreeViewCompact, SelectedNode } from "@/components/landunit";
import { useMapFilterStore } from "@/lib/stores/mapFilterStore";
import { DetailPanel } from "./DetailPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MainLayoutWithRightPanel } from "../MainLayoutWithRightPanel";

interface DashboardPanelProps {
  user?: {
    name: string;
    email: string;
  };
  onActionClick?: (actionId: string) => void;
}

export function DashboardPanel({ user, onActionClick }: DashboardPanelProps) {
  const setSelectedNode = useMapFilterStore((state) => state.setSelectedNode);
  const [detailNode, setDetailNode] = useState<SelectedNode | null>(null);

  const handleSelectionChange = (node: SelectedNode | null) => {
    // Update global map filter state
    setSelectedNode(node);
  };

  const handleViewDetails = (node: SelectedNode) => {
    setDetailNode(node);
    // Also update global state so MainLayoutWithRightPanel can access it
    setSelectedNode(node);
    console.log("📋 Opening detail panel for:", node.item.name);
  };

  const handleCloseDetails = () => {
    setDetailNode(null);
    // Also clear global state
    setSelectedNode(null);
  };

  // Show detail panel if a node is selected for details
  if (detailNode) {
    return (
      <div className="flex flex-col h-full">
        <DetailPanel 
          node={detailNode} 
          onClose={handleCloseDetails}
          onMenuSelect={(menuId) => {
            // This will be handled by the parent layout
            console.log("Menu selected:", menuId);
          }}
        />
      </div>
    );
  }

  // Show tree view by default
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Land Unit Tree View with Search & Selection */}
      <LandUnitTreeViewCompact 
        onSelectionChange={handleSelectionChange}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}

