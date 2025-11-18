/**
 * React hooks for Land Unit API
 * Provides type-safe hooks for fetching hierarchical land unit data
 */

import { useQuery } from "@tanstack/react-query";

// Types matching API response
export interface LandUnitItem {
  id: string;
  name: string;
  [key: string]: any; // Additional attributes from ArcGIS
}

export interface LandUnitResponse {
  success: boolean;
  level: string;
  count: number;
  filters: Record<string, string | undefined>;
  warning?: string;
  data: LandUnitItem[];
  metadata: {
    layerId: number;
    nameField: string;
    idField: string;
    whereClause: string;
  };
}

export type LandUnitLevel = "pu" | "region" | "farm" | "block" | "paddock";

export interface LandUnitFilters {
  pu?: string;
  region?: string;
  farm?: string;
  block?: string;
  paddock?: string;
}

// Query keys factory
export const landUnitKeys = {
  all: ["landunit"] as const,
  level: (level: LandUnitLevel) => [...landUnitKeys.all, level] as const,
  filtered: (level: LandUnitLevel, filters: LandUnitFilters) =>
    [...landUnitKeys.level(level), filters] as const,
};

/**
 * Fetch land units from API
 */
async function fetchLandUnits(
  level: LandUnitLevel,
  filters?: LandUnitFilters
): Promise<LandUnitResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const url = `/api/landunit/${level}${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch land units");
  }

  return response.json();
}

/**
 * Hook to fetch land units by level with optional filters and options
 */
export function useLandUnits(level: LandUnitLevel, filters?: LandUnitFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: landUnitKeys.filtered(level, filters || {}),
    queryFn: () => fetchLandUnits(level, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

/**
 * Hook to fetch production units (top level)
 */
export function useProductionUnits() {
  return useLandUnits("pu");
}

/**
 * Hook to fetch regions by production unit
 */
export function useRegions(puName?: string) {
  return useLandUnits("region", puName ? { pu: puName } : undefined);
}

/**
 * Hook to fetch farms by filters
 */
export function useFarms(filters?: { pu?: string; region?: string }) {
  return useLandUnits("farm", filters);
}

/**
 * Hook to fetch blocks by filters
 */
export function useBlocks(filters?: { pu?: string; region?: string; farm?: string }) {
  return useLandUnits("block", filters);
}

/**
 * Hook to fetch paddocks by filters
 */
export function usePaddocks(filters?: {
  pu?: string;
  region?: string;
  farm?: string;
  block?: string;
}) {
  return useLandUnits("paddock", filters);
}
