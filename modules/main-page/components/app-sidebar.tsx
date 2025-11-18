"use client"

import * as React from "react"
import {
  Home,
  Users,
  Database,
  BarChart3,
  Settings,
  Building,
  Shield,
  Activity,
  FileText,
  Eye,
  Edit,
  UserPlus,
  UserCheck,
  Folder,
  Sun,
  Moon,
  BookOpen,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { DashboardPanel } from "./sidebar-panels"

// Types
type QuickAction = {
  name: string;
  action: string;
  description: string;
  date: string;
  url: string;
  icon: LucideIcon;
};

type QuickActionsData = {
  [key: string]: QuickAction[];
};

type SidebarPanelComponent = {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
};

type SidebarPanels = {
  [key: string]: SidebarPanelComponent;
};

// GeoHUB navigation data
const defaultData = {
  user: {
    name: "Administrator",
    email: "admin@globalpapuaabadi.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Fields Portal",
      url: "/main",
      icon: Home,
      isActive: true,
    },
    // {
    //   title: "Geospatial Data",
    //   url: "/main?action=data",
    //   icon: Database,
    //   isActive: false,
    // },
    // {
    //   title: "Analytics",
    //   url: "/main?action=reports",
    //   icon: BarChart3,
    //   isActive: false,
    // },
    // {
    //   title: "Settings",
    //   url: "/main?action=settings",
    //   icon: Settings,
    //   isActive: false,
    // },
  ],
  quickActions: {
    "Fields Portal": [
      {
        name: "System Overview",
        action: "View Dashboard Stats",
        description: "Current system metrics and user activity",
        date: "Live",
        url: "/main",
        icon: BarChart3,
      },
    ],
  },
  // Component-based sidebar panels
  sidebarPanels: {
    "Fields Portal": {
      component: DashboardPanel,
      props: {},
    },
    // "Geospatial Data": [
    //   {
    //     name: "Upload Dataset",
    //     action: "Data Upload",
    //     description: "Upload new geospatial datasets and files",
    //     date: "Available",
    //     url: "/data/upload",
    //     icon: FileText,
    //   },
    //   {
    //     name: "Browse Datasets",
    //     action: "Data Explorer",
    //     description: "View and manage existing spatial datasets",
    //     date: "Available",
    //     url: "/data/datasets",
    //     icon: Eye,
    //   },
    //   {
    //     name: "Create Map",
    //     action: "Map Builder",
    //     description: "Create interactive maps and visualizations",
    //     date: "Available",
    //     url: "/maps/create",
    //     icon: Edit,
    //   },
    //   {
    //     name: "Manage Layers",
    //     action: "Layer Management",
    //     description: "Organize and configure map layers",
    //     date: "Available",
    //     url: "/maps/layers",
    //     icon: Folder,
    //   },
    // ],
    // "Analytics": [
    //   {
    //     name: "Usage Reports",
    //     action: "System Usage",
    //     description: "Analyze system usage patterns and statistics",
    //     date: "Updated",
    //     url: "/reports/usage",
    //     icon: BarChart3,
    //   },
    //   {
    //     name: "Data Analytics",
    //     action: "Data Insights",
    //     description: "Generate insights from geospatial data",
    //     date: "Available",
    //     url: "/reports/analytics",
    //     icon: Activity,
    //   },
    // ],
    // "Settings": [
    //   {
    //     name: "System Configuration",
    //     action: "General Settings",
    //     description: "Configure general system settings and preferences",
    //     date: "Available",
    //     url: "/admin/settings/general",
    //     icon: Settings,
    //   },
    //   {
    //     name: "Security Settings",
    //     action: "Security Config",
    //     description: "Manage security policies and authentication",
    //     date: "Available",
    //     url: "/admin/settings/security",
    //     icon: Shield,
    //   },
    //   {
    //     name: "API Configuration",
    //     action: "API Settings",
    //     description: "Configure API endpoints and integrations",
    //     date: "Available",
    //     url: "/admin/settings/api",
    //     icon: Database,
    //   },
    // ],
  },
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    permissions: string[];
    roles: string[];
  };
  onQuickActionChange?: (actionId: string) => void;
  onHierarchyClick?: () => void;
  usePanelComponents?: boolean; // Toggle between quickActions and components
}

export function AppSidebar({ user, onQuickActionChange, onHierarchyClick, usePanelComponents = true, ...props }: AppSidebarProps) {
  const router = useRouter()

  const handleQuickActionClick = (actionUrl: string) => {
    // Extract action ID from URL or action name
    const actionId = getActionIdFromUrl(actionUrl);
    if (onQuickActionChange && actionId) {
      onQuickActionChange(actionId);
    }
  }

  const handlePanelActionClick = (actionId: string) => {
    if (onQuickActionChange) {
      onQuickActionChange(actionId);
    }
  }

  const getActionIdFromUrl = (url: string): string => {
    // Map URLs to action IDs
    const urlToActionMap: Record<string, string> = {
      '/main': 'dashboard',
      '/main?action=users': 'users',
      '/main?action=roles': 'roles',
      '/main?action=organizations': 'organizations',
      '/main?action=user-groups': 'user-groups',
      '/main?action=lark-users': 'lark-users',
      '/main?action=user-detail': 'user-detail',
      '/main?action=user-create': 'user-create',
      '/main?action=user-edit': 'user-edit',
      '/main?action=data': 'data',
      '/main?action=reports': 'reports',
      '/main?action=settings': 'settings',

      // Add more mappings as needed
    };
    return urlToActionMap[url] || 'dashboard';
  }



  // Merge user data with default data
  const data = {
    ...defaultData,
    user: user ? {
      name: user.name,
      email: user.email,
      avatar: user.avatar || defaultData.user.avatar,
    } : defaultData.user,
  };

  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain?.[0] || defaultData.navMain[0])
  const [quickActions, setQuickActions] = React.useState<QuickAction[]>((data.quickActions as QuickActionsData)[data.navMain?.[0]?.title || defaultData.navMain[0].title] || [])
  const { setOpen } = useSidebar()

  // Get active panel component
  const activePanelConfig = (defaultData.sidebarPanels as SidebarPanels)[activeItem?.title || ''];
  const ActivePanelComponent = activePanelConfig?.component;

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="/main" title="GeoHUB">
                  {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"> */}
                    <Image src="/logo.webp" alt="GeoHUB" width={32} height={32} />
                  {/* </div> */}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">GeoHUB</span>
                    <span className="truncate text-xs">GIS Platform</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setQuickActions((data.quickActions as QuickActionsData)[item.title] || [])
                        setOpen(true)

                        // Set active quick action based on the clicked item
                        if (item.title === "Main Page") {
                          onQuickActionChange?.('dashboard');
                        } else if (item.title === "Geospatial Data") {
                          onQuickActionChange?.('data');
                        } else if (item.title === "Analytics") {
                          onQuickActionChange?.('reports');
                        } else if (item.title === "Settings") {
                          onQuickActionChange?.('settings');
                        }
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-3">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          {usePanelComponents && ActivePanelComponent ? (
            // Render custom component
            <ActivePanelComponent
              user={data.user}
              onActionClick={handlePanelActionClick}
              {...(activePanelConfig?.props || {})}
            />
          ) : (
            // Fallback to quick actions list
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {quickActions.map((action, index) => (
                  <button
                    key={`${action.name}-${index}`}
                    onClick={() => handleQuickActionClick(action.url)}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 w-full text-left"
                  >
                    <div className="flex w-full items-center gap-2">
                      <action.icon className="w-4 h-4 text-sidebar-primary" />
                      <span className="font-medium">{action.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{action.date}</span>
                    </div>
                    <span className="text-xs text-sidebar-primary font-medium">{action.action}</span>
                    <span className="line-clamp-2 w-[260px] text-xs text-muted-foreground whitespace-break-spaces">
                      {action.description}
                    </span>
                  </button>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onHierarchyClick}
            className="w-full justify-start gap-2 text-sm"
          >
            <BookOpen className="w-4 h-4" />
            Learn Land Unit Hierarchy
          </Button>
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  )
}
