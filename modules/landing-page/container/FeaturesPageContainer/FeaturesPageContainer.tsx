import React from 'react';
import AppHeader from '@/modules/layout/components/AppHeader';
import SubNavbar from '@/modules/layout/components/SubNavbar';
import AppFooter from '@/components/app-footer';
import { UserWithRoles } from "@/lib/auth/utils";

interface FeaturesPageContainerProps {
  user: UserWithRoles | null;
  children?: React.ReactNode;
}

export default function FeaturesPageContainer({ user, children }: FeaturesPageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />
      <SubNavbar />
      <div className="flex-1">
        {children}
      </div>
      <AppFooter />
    </div>
  );
}

