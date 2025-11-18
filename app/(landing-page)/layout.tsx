import React from 'react';
import { LandingPageLayout } from '@/modules/landing-page/layout/LandingPageLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LandingPageLayout>
      {children}
    </LandingPageLayout>
  );
}
