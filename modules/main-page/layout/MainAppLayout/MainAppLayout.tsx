'use client';

import React, { useState } from 'react';
import { useAuth, useDashboardGuard } from '@/hooks';
import { AppSidebar } from '../../../main-page/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MainAppContainer } from '../../container/MainAppContainer';
import { MainAppLayoutProps } from '../../types';
import { useTheme } from 'next-themes';
import { Sun, Moon, Home } from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import { useEffect } from 'react';
import { LandUnitHierarchyModal } from '@/modules/land-unit-hierarchy';

export const MainAppLayout: React.FC<MainAppLayoutProps> = ({
  children,
  initialActiveAction = 'dashboard',
  userId,
}) => {
  // Use auth guard for authentication and permissions
  const { isLoading: authLoading, fallback } = useDashboardGuard();
  const { data: user, isLoading, error } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // State untuk active quick action dari sidebar
  const [activeQuickAction, setActiveQuickAction] = useState(
    userId ? 'user-detail' : initialActiveAction
  );

  // Land Unit Hierarchy Modal - show on first visit
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show hierarchy modal on first visit
  useEffect(() => {
    const hasSeenHierarchy = localStorage.getItem('hasSeenLandUnitHierarchy');
    if (!hasSeenHierarchy) {
      setShowHierarchyModal(true);
    }
  }, []);

  // Handle theme change
  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Handle home click
  const handleHomeClick = () => {
    // Navigate to home or dashboard
    window.location.href = '/';
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">Failed to load user data</p>
        </div>
      </div>
    );
  }

  // Show auth guard fallback if needed
  if (fallback) {
    return fallback;
  }

  return (
    <main className="MainAppLayout flex min-h-screen">
      <SidebarProvider
        style={{
          "--sidebar-width": "350px",
        } as React.CSSProperties}
      >
        <AppSidebar
          user={user}
          onQuickActionChange={setActiveQuickAction}
          onHierarchyClick={() => setShowHierarchyModal(true)}
        />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b py-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/main">
                      GeoHUB
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Main</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Moved from SidebarFooter */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeChange}
                className="h-8 w-8 p-0 hover:bg-sidebar-accent rounded-md"
                title={!mounted ? "Toggle theme" : theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {!mounted ? (
                  <Sun className="w-4 h-4" />
                ) : theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Home Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="h-8 w-8 p-0 hover:bg-sidebar-accent rounded-md"
                title="Home"
              >
                <Home className="w-4 h-4" />
              </Button>

              {/* User Nav */}
              <NavUser user={{
                name: user.name || 'User',
                avatar: user.avatar || ''
              }} />
            </div>
          </header>
          <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900">
            <MainAppContainer
              user={user}
              activeQuickAction={activeQuickAction}
              userId={userId}
            />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      
      {/* Land Unit Hierarchy Modal */}
      <LandUnitHierarchyModal
        open={showHierarchyModal}
        onOpenChange={(open) => {
          setShowHierarchyModal(open);
          if (!open) {
            localStorage.setItem('hasSeenLandUnitHierarchy', 'true');
          }
        }}
      />
    </main>
  );
};
