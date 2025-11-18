/**
 * Simple store for map filtering state
 * Allows communication between TreeView (sidebar) and Map (main content)
 */

import { create } from "zustand";
import { SelectedNode } from "@/components/landunit";

interface MapFilterState {
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
  
  // Build definition expression for ArcGIS layers
  getDefinitionExpression: () => string;
  
  // Track active menu for layer visibility control
  selectedMenu: string | null;
  setSelectedMenu: (menu: string | null) => void;
}

export const useMapFilterStore = create<MapFilterState>((set, get) => ({
  selectedNode: null,
  selectedMenu: null,
  
  setSelectedNode: (node) => {
    set({ selectedNode: node });
    
    if (node) {
      console.log("🗺️ Map filter applied:", {
        level: node.level,
        name: node.item.name,
        expression: get().getDefinitionExpression(),
      });
    } else {
      console.log("🔄 Map filter cleared");
    }
  },
  
  setSelectedMenu: (menu) => {
    set({ selectedMenu: menu });
    console.log("📋 Active menu changed:", menu);
  },
  
  getDefinitionExpression: () => {
    const { selectedNode } = get();
    
    if (!selectedNode) {
      return "1=1"; // No filter - show all
    }
    
    // Build WHERE clause based on selected level
    const conditions: string[] = [];
    const filters = selectedNode.filters;
    
    if (filters.mill) {
      conditions.push(`mill = '${filters.mill}'`);
    }
    if (filters.region) {
      conditions.push(`region = '${filters.region}'`);
    }
    if (filters.farm) {
      conditions.push(`farm = '${filters.farm}'`);
    }
    if (filters.block) {
      conditions.push(`block = '${filters.block}'`);
    }
    if (filters.paddock) {
      conditions.push(`paddock = '${filters.paddock}'`);
    }
    
    // Add current level filter
    const levelFieldMap: Record<string, string> = {
      mill: "mill",
      region: "region",
      farm: "farm",
      block: "block",
      paddock: "paddock",
    };
    
    const fieldName = levelFieldMap[selectedNode.level];
    if (fieldName) {
      conditions.push(`${fieldName} = '${selectedNode.item.name}'`);
    }
    
    return conditions.length > 0 ? conditions.join(" AND ") : "1=1";
  },
}));

