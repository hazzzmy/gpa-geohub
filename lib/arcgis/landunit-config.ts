/**
 * Land Unit Configuration for ArcGIS MapServer
 * Based on landunit.ipynb notebook
 */

// Land Unit Levels - matches MapServer layer IDs
export const LANDUNIT_LEVELS = {
  PU: "pu",
  REGION: "region",
  FARM: "farm",
  BLOCK: "block",
  PADDOCK: "paddock",
} as const;

export type LandUnitLevel = (typeof LANDUNIT_LEVELS)[keyof typeof LANDUNIT_LEVELS];

// MapServer Layer Configuration
export const LAYER_CONFIG = {
  [LANDUNIT_LEVELS.PU]: {
    layerId: 4,
    nameField: "pu",
    idField: "pu_id",
    parent: null,
  },
  [LANDUNIT_LEVELS.REGION]: {
    layerId: 3,
    nameField: "region",
    idField: "region_id",
    parent: "pu",
  },
  [LANDUNIT_LEVELS.FARM]: {
    layerId: 2,
    nameField: "farm",
    idField: "farm_id",
    parent: "region",
  },
  [LANDUNIT_LEVELS.BLOCK]: {
    layerId: 1,
    nameField: "block",
    idField: "block_id",
    parent: "farm",
  },
  [LANDUNIT_LEVELS.PADDOCK]: {
    layerId: 0,
    nameField: "paddock",
    idField: "paddock_id",
    parent: "block",
  },
} as const;

// Base MapServer URL
export function getMapServerUrl(): string {
  // Use LAND_UNITS_SERVICE_URL first, then fallback to ARCGIS_MAP_SERVICE_URL, then default
  const baseUrl = 
    // process.env.LAND_UNITS_SERVICE_URL || 
    // process.env.ARCGIS_MAP_SERVICE_URL || 
    "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Unit/MapServer";
  return baseUrl;
}

// Build query URL for specific level
export function buildQueryUrl(level: LandUnitLevel): string {
  const config = LAYER_CONFIG[level];
  const baseUrl = getMapServerUrl();
  return `${baseUrl}/${config.layerId}/query`;
}

// Build WHERE clause from filters
export interface LandUnitFilters {
  pu?: string;
  region?: string;
  farm?: string;
  block?: string;
  paddock?: string;
}

export function buildWhereClause(filters: LandUnitFilters, level?: LandUnitLevel): string {
  const conditions: string[] = [];

  // Add conditions based on available filters
  // Skip pu and region filters for all levels
  if (filters.farm) {
    conditions.push(`farm = '${filters.farm}'`);
  }
  if (filters.block) {
    conditions.push(`block = '${filters.block}'`);
  }
  if (filters.paddock) {
    conditions.push(`paddock = '${filters.paddock}'`);
  }

  // Return 1=1 if no filters (get all)
  return conditions.length > 0 ? conditions.join(" AND ") : "1=1";
}

// Validate that filters are appropriate for the level
export function validateFilters(level: LandUnitLevel, filters: LandUnitFilters): {
  valid: boolean;
  message?: string;
} {
  const config = LAYER_CONFIG[level];
  
  // For levels with parents, parent filter should be provided for efficiency
  if (config.parent && !filters[config.parent as keyof LandUnitFilters]) {
    return {
      valid: true, // Still valid, but warning
      message: `Warning: Querying ${level} without ${config.parent} filter may return many results`,
    };
  }

  return { valid: true };
}

// Get all supported levels
export function getAllLevels(): LandUnitLevel[] {
  return Object.values(LANDUNIT_LEVELS);
}

// Check if level is valid
export function isValidLevel(level: string): level is LandUnitLevel {
  return Object.values(LANDUNIT_LEVELS).includes(level as LandUnitLevel);
}

