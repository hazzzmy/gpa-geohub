'use client';

import React, { Suspense } from 'react';
import { UserWithRoles } from '@/lib/auth/utils';
import DashboardContent from './admin/DashboardContent';

interface ContentRendererProps {
  componentName: string;
  user: UserWithRoles;
  userId?: string;
}

// Loading component
const LoadingContent = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Error fallback component
const ErrorContent = ({ componentName }: { componentName: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Error Loading Component
      </h3>
      <p className="text-muted-foreground">
        Failed to load component: {componentName}
      </p>
    </div>
  </div>
);

// Component registry - only DashboardContent available
const COMPONENT_REGISTRY: Record<string, React.ComponentType<{ user: UserWithRoles; userId?: string }>> = {
  DashboardContent: DashboardContent,
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  componentName,
  user,
  userId,
}) => {
  const Component = COMPONENT_REGISTRY[componentName];

  if (!Component) {
    return <ErrorContent componentName={componentName} />;
  }

  return (
    <Suspense fallback={<LoadingContent />}>
      <Component user={user} userId={userId} />
    </Suspense>
  );
};