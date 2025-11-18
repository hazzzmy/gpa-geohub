// Auth hooks (React Query based)
export {
  useAuth,
  useInvalidateAuth,
  useUserPermissions,
  useUserRoles,
  useCurrentUser,
  authKeys
} from './use-auth';

// Auth guard hooks
export {
  useAuthGuard,
  useAdminGuard,
  useDashboardGuard,
  useUsersGuard,
  useRolesGuard,
  usePermissionsGuard
} from './use-auth-guard';

// Utility hooks
export { useIsMobile } from './use-mobile';

// ArcGIS hooks
export { useArcGISToken } from './use-arcgis-token';
export type { ArcGISTokenData, UseArcGISTokenResult } from './use-arcgis-token';

// Land Unit hooks
export {
  useLandUnits,
  useMills,
  useRegions,
  useFarms,
  useBlocks,
  usePaddocks,
  landUnitKeys,
} from './use-landunit';
export type { LandUnitItem, LandUnitResponse, LandUnitLevel, LandUnitFilters } from './use-landunit';

