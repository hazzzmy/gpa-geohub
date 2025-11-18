import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LayoutState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

interface LayoutActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  addBreadcrumb: (breadcrumb: { label: string; href?: string }) => void;
  clearBreadcrumbs: () => void;
}

type LayoutStore = LayoutState & LayoutActions;

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    (set, get) => ({
      // State
      sidebarOpen: false,
      theme: 'system',
      sidebarCollapsed: false,
      breadcrumbs: [],

      // Actions
      toggleSidebar: () => set(
        (state) => ({ sidebarOpen: !state.sidebarOpen }),
        false,
        'layout/toggleSidebar'
      ),

      setSidebarOpen: (open) => set(
        { sidebarOpen: open },
        false,
        'layout/setSidebarOpen'
      ),

      setTheme: (theme) => set(
        { theme },
        false,
        'layout/setTheme'
      ),

      toggleSidebarCollapsed: () => set(
        (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
        false,
        'layout/toggleSidebarCollapsed'
      ),

      setSidebarCollapsed: (collapsed) => set(
        { sidebarCollapsed: collapsed },
        false,
        'layout/setSidebarCollapsed'
      ),

      setBreadcrumbs: (breadcrumbs) => set(
        { breadcrumbs },
        false,
        'layout/setBreadcrumbs'
      ),

      addBreadcrumb: (breadcrumb) => set(
        (state) => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb]
        }),
        false,
        'layout/addBreadcrumb'
      ),

      clearBreadcrumbs: () => set(
        { breadcrumbs: [] },
        false,
        'layout/clearBreadcrumbs'
      ),
    }),
    {
      name: 'layout-store',
    }
  )
);





