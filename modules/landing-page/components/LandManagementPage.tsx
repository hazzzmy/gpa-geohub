'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '@/lib/stores/companyStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from '@/lib/icons';
import OverviewContent from './land-management/OverviewContent';
import ClearingContent from './land-management/ClearingContent';
import PreparationContent from './land-management/PreparationContent';
import DevelopmentContent from './land-management/DevelopmentContent';
import PlantedContent from './land-management/PlantedContent';

type TabType = 'overview' | 'clearing' | 'preparation' | 'development' | 'planted';

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'clearing', label: 'Clearing' },
  { id: 'preparation', label: 'Preparation' },
  { id: 'development', label: 'Development' },
  { id: 'planted', label: 'Planted' },
];

export default function LandManagementPage() {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Redirect to home if no company selected
  if (!selectedCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            Please select a company first
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="pt-6 pb-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Link href="/company/features" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Features</span>
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Title and Tab Navigation - Vertical Layout */}
          <div className="flex flex-col items-center gap-4 pb-6">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Land Management
            </motion.h1>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-sm"
            >
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-500 rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'clearing' && <ClearingContent />}
          {activeTab === 'preparation' && <PreparationContent />}
          {activeTab === 'development' && <DevelopmentContent />}
          {activeTab === 'planted' && <PlantedContent />}
        </motion.div>
      </div>
    </div>
  );
}

