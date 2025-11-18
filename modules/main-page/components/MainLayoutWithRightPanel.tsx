"use client";

import React, { useState, useEffect } from "react";
import { SelectedNode } from "@/components/landunit";
import { RightPanel } from "./sidebar-panels/RightPanel";
import { useMapFilterStore } from "@/lib/stores/mapFilterStore";

interface MainLayoutWithRightPanelProps {
  children: React.ReactNode;
  selectedNode?: SelectedNode | null;
  onCloseDetails?: () => void;
}

export function MainLayoutWithRightPanel({ 
  children, 
  selectedNode, 
  onCloseDetails 
}: MainLayoutWithRightPanelProps) {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const setSelectedMenuStore = useMapFilterStore((state) => state.setSelectedMenu);

  // Listen for menu selection events from DetailPanel
  useEffect(() => {
    const handleMenuSelect = (event: CustomEvent) => {
      console.log("MainLayout received menuSelect event:", event.detail);
      const menuId = event.detail.menuId;
      setSelectedMenu(menuId);
      setSelectedMenuStore(menuId); // Update store for map layer control
    };

    window.addEventListener('menuSelect', handleMenuSelect as EventListener);
    return () => {
      window.removeEventListener('menuSelect', handleMenuSelect as EventListener);
    };
  }, [setSelectedMenuStore]);

  // Debug logging
  useEffect(() => {
    console.log("MainLayout state - selectedNode:", selectedNode);
    console.log("MainLayout state - selectedMenu:", selectedMenu);
  }, [selectedNode, selectedMenu]);

  const handleCloseRightPanel = () => {
    setSelectedMenu(null);
    setSelectedMenuStore(null); // Clear menu from store
  };

  return (
    <div className="flex h-full w-full">
      {/* Main Content (Map) */}
      <div className="flex-1 h-['80vh']">
        {children}
      </div>

      {/* Right Panel for Activity Details */}
      {selectedNode && selectedMenu && (
        <RightPanel
          selectedMenu={selectedMenu}
          landUnit={{
            name: selectedNode.item.name,
            fid_1: selectedNode.item.fid_1,
            area_ha: selectedNode.item.area_ha,
          }}
          onClose={handleCloseRightPanel}
        />
      )}
    </div>
  );
}
