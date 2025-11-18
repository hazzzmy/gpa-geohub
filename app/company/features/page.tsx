import React from 'react';
import { FeaturesPageLayout } from '@/modules/landing-page/layout/FeaturesPageLayout';
import FeaturesPage from '@/modules/landing-page/components/FeaturesPage';

export default function CompanyFeaturesPage() {
  return (
    <FeaturesPageLayout>
      <FeaturesPage />
    </FeaturesPageLayout>
  );
}

