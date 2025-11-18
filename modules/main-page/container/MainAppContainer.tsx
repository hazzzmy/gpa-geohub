'use client';

import React from 'react';
import { MainAppContainerProps } from '../types';
import { ContentRenderer } from '../components/ContentRenderer';

export const MainAppContainer: React.FC<MainAppContainerProps> = ({
  user,
  activeQuickAction,
  userId,
}) => {
  // Map quick action IDs to component names
  const getComponentName = (actionId: string) => {
    const componentMap: Record<string, string> = {
      'dashboard': 'DashboardContent',
      'data': 'DashboardContent', // For now, show dashboard for data
      'reports': 'DashboardContent', // For now, show dashboard for reports
      'settings': 'DashboardContent', // For now, show dashboard for settings
      // Add more mappings as needed
    };
    return componentMap[actionId] || 'DashboardContent';
  };

  const componentName = activeQuickAction ? getComponentName(activeQuickAction) : 'DashboardContent';

  return (
    <div className="flex flex-1 flex-col">
      <ContentRenderer
        componentName={componentName}
        user={user}
        userId={userId}
      />
    </div>
  );
};
