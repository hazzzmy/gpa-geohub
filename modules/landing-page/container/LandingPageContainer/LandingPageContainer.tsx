import React from 'react';
import AppHeader from '@/modules/layout/components/AppHeader';
import HeroSections from '../../components/HeroSections';
import AppFooter from '@/components/app-footer';
import { UserWithRoles } from "@/lib/auth/utils";

interface LandingPageContainerProps {
  user: UserWithRoles | null;
  children?: React.ReactNode;
}

export default function LandingPageContainer({ user, children }: LandingPageContainerProps) {
  return (
    <div className="h-[calc(100vh-155px)]">
      <AppHeader user={user} />
      <HeroSections user={user} />
      {children}
      <AppFooter />
    </div>
  );
}
