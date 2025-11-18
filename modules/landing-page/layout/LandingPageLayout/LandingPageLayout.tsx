'use client';

import { useAuth } from '@/hooks/use-auth';
import { LandingPageContainer } from "../../container/LandingPageContainer";
import { useEffect } from 'react';

interface LandingPageLayoutProps {
  children?: React.ReactNode;
}

export default function LandingPageLayout({ children }: LandingPageLayoutProps) {
  const { data: user, isLoading, error, refetch } = useAuth();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading page</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <LandingPageContainer user={user ?? null}>
      {children}
    </LandingPageContainer>
  );
}
