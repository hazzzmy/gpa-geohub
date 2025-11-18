"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Loader2, AlertCircle, Search, X, Info } from "lucide-react";
import { useLandUnits, LandUnitItem } from "@/hooks/use-landunit";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SelectedNode {
  item: LandUnitItem;
  level: "pu" | "region" | "farm" | "block" | "paddock";
  filters: Record<string, string>;
}

interface TreeNodeProps {
  item: LandUnitItem;
  level: "pu" | "region" | "farm" | "block" | "paddock";
  filters: Record<string, string>;
  depth: number;
  searchQuery?: string;
  selectedNode?: SelectedNode | null;
  onSelect?: (node: SelectedNode) => void;
  onViewDetails?: (node: SelectedNode) => void;
}

/**
 * Recursive tree node component
 */
function TreeNode({ item, level, filters, depth, searchQuery, selectedNode, onSelect, onViewDetails }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this node is selected
  const isSelected = selectedNode?.item.id === item.id && selectedNode?.level === level;

  // Check if this node matches search query
  const matchesSearch = useMemo(() => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.fid_1?.toLowerCase().includes(query) ||
      item.id?.toLowerCase().includes(query)
    );
  }, [searchQuery, item]);

  // Determine child level
  const childLevelMap = {
    pu: "region",
    region: "farm",
    farm: "block",
    block: "paddock",
    paddock: null,
  } as const;

  const childLevel = childLevelMap[level];
  const hasChildren = childLevel !== null;

  // Build filters for child query
  const childFilters = {
    ...filters,
    [level]: item.name,
  };

  // Fetch children only when expanded and has children
  const {
    data: childData,
    isLoading,
    error,
  } = useLandUnits(
    childLevel as any,
    childFilters,
    {
      enabled: isExpanded && hasChildren && childLevel !== null,
    }
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect({ item, level, filters });
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails({ item, level, filters });
    }
  };

  const children = childData?.data || [];
  const hasLoadedChildren = isExpanded && children.length > 0;

  // Don't render if doesn't match search
  if (!matchesSearch) {
    return null;
  }

  return (
    <div className="select-none">
      {/* Node Header */}
      <div
        className={cn(
          "group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer transition-colors",
          isExpanded && "bg-accent/50",
          isSelected && "bg-primary/20 border border-primary"
        )}
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onClick={handleToggle}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-4 h-4" /> // Spacer for leaf nodes
        )}

        {/* Node Label */}
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase">{level === 'pu' ? 'Productions Unit' : level}</span>
          <span className="text-sm font-medium">{item.name}</span>
        </div>

        {item.fid_1 && (
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
            {item.fid_1}
        </span>
        )}
        
        {/* Detail Button */}
        <button
          onClick={handleViewDetails}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
          title="View details"
        >
          <Info className="w-3 h-3 text-primary" />
        </button>
        
        {/* Count Badge */}
        {hasLoadedChildren && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {children.length}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && isExpanded && (
        <div
          className="flex items-center gap-2 py-2 px-2 text-xs text-destructive"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
        >
          <AlertCircle className="w-3 h-3" />
          <span>Failed to load {childLevel}s</span>
        </div>
      )}

      {/* Children */}
      {isExpanded && hasChildren && !error && (
        <div className="mt-1">
          {children.length === 0 && !isLoading ? (
            <div
              className="text-xs text-muted-foreground py-1 px-2"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              No {childLevel}s found
            </div>
          ) : (
            children.map((child, index) => {
              // Create unique key: use id if available, otherwise use level + index + name combination
              const uniqueKey = child.id 
                ? `${childLevel}-${child.id}-${index}` 
                : `${childLevel}-${index}-${child.name || 'unknown'}`;
              
              return (
                <TreeNode
                  key={uniqueKey}
                  item={child}
                  level={childLevel as any}
                  filters={childFilters}
                  depth={depth + 1}
                  searchQuery={searchQuery}
                  selectedNode={selectedNode}
                  onSelect={onSelect}
                  onViewDetails={onViewDetails}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Land Unit Tree View Component
 * Displays hierarchical structure: Mill > Region > Farm > Block > Paddock
 */
export interface LandUnitTreeViewProps {
  onSelectionChange?: (node: SelectedNode | null) => void;
  onViewDetails?: (node: SelectedNode) => void;
  showSearch?: boolean;
}

export function LandUnitTreeView({ onSelectionChange, onViewDetails, showSearch = true }: LandUnitTreeViewProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const { data, isLoading, error, refetch } = useLandUnits("pu");

  const handleSelect = (node: SelectedNode) => {
    setSelectedNode(node);
    if (onSelectionChange) {
      onSelectionChange(node);
    }
  };

  const handleViewDetailsClick = (node: SelectedNode) => {
    if (onViewDetails) {
      onViewDetails(node);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    setSelectedNode(null);
    if (onSelectionChange) {
      onSelectionChange(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mb-2" />
        <p className="text-sm text-destructive mb-2">Failed to load land units</p>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const mills = data?.data || [];

  if (mills.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No productions units found
      </div>
    );
  }

  return (
    <div className="flex gap-4 flex-col">
      {/* Selected Node Info */}
      {/* {selectedNode && (
        <div className="flex items-center justify-between bg-primary/10 p-2 rounded-md text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground uppercase">{selectedNode.level}</span>
            <span className="font-medium">{selectedNode.item.name}</span>
            {selectedNode.item.fid_1 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {selectedNode.item.fid_1}
              </span>
            )}
          </div>
          <button
            onClick={handleClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )} */}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-medium">Land Unit Selection</h3>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, fid_1, or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Tree */}
      <div className="max-h-[550px] overflow-y-auto pr-2">
        {mills.map((mill, index) => {
          // Create unique key: use id if available, otherwise use index + name combination
          const uniqueKey = mill.id 
            ? `mill-${mill.id}-${index}` 
            : `mill-${index}-${mill.name || 'unknown'}`;
          
          return (
            <TreeNode 
              key={uniqueKey}
              item={mill} 
              level="pu" 
              filters={{}} 
              depth={0}
              searchQuery={searchQuery}
              selectedNode={selectedNode}
              onSelect={handleSelect}
              onViewDetails={handleViewDetailsClick}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for sidebar
 */
export function LandUnitTreeViewCompact({ 
  onSelectionChange,
  onViewDetails,
}: { 
  onSelectionChange?: (node: SelectedNode | null) => void;
  onViewDetails?: (node: SelectedNode) => void;
} = {}) {
  return (
    <LandUnitTreeView 
      onSelectionChange={onSelectionChange} 
      onViewDetails={onViewDetails}
      showSearch={true} 
    />
  );
}

