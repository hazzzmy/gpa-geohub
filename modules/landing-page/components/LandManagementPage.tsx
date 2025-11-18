'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useCompanyStore } from '@/lib/stores/companyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight } from '@/lib/icons';
import { Loader2, AlertCircle } from 'lucide-react';
import ArcGISDashboardEmbed from './ArcGISDashboardEmbed';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
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

          {/* Title and Tab Navigation - Horizontal Layout */}
          <div className="flex flex-row items-center justify-between gap-4 pb-6">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight flex-shrink-0"
            >
              Land Management
            </motion.h1>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-sm flex-shrink-0"
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

// Content Components for each tab
function OverviewContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['land-clearing-stats'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch land clearing statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: disposalData, isLoading: disposalLoading, error: disposalError } = useQuery({
    queryKey: ['land-clearing-disposal'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/disposal');
      if (!response.ok) {
        throw new Error('Failed to fetch disposal statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        totalDisposal: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  });

  const farms = ['F1', 'F2', 'F3', 'F4', 'F5'] as const;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Calculate progress data
  const totalArea = data?.totalArea || 0;
  const totalDisposal = disposalData?.totalDisposal || 0;
  const progressPercentage = totalArea > 0 ? (totalDisposal / totalArea) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Total Area and Farm Cards Inline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-4 w-full">
          {/* Total Area Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-0 shadow-xl flex-[1.5] min-w-[280px] max-w-[400px]">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="flex-1">
                  <p className="text-blue-100 dark:text-blue-200 text-sm font-medium mb-2">
                    Total Area
                  </p>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 text-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Error</span>
                    </div>
                  ) : (
                    <p className="text-4xl font-bold text-white">
                      {formatter.format(data?.totalArea || 0)} <span className="text-xl font-normal">Ha</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm Cards Inline */}
          {farms.map((farm, index) => {
            const area = data?.farms[farm] || 0;
            const percentage = data && data.totalArea > 0 ? (area / data.totalArea) * 100 : 0;
            const color = colors[index % colors.length];

            return (
              <Card
                key={farm}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105 flex-1 min-w-[160px]"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {farm}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Error</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {formatter.format(area)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Share</span>
                          <span className="font-semibold">{formatter.format(percentage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Land Clearing Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-4 w-full items-stretch">
          {/* Doughnut Chart Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl flex-[1.5] min-w-[280px] max-w-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Total Land Clearing Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on Disposal Area
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isLoading || disposalLoading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : error || disposalError ? (
                <div className="flex items-center justify-center h-[250px] text-red-600 dark:text-red-400">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  <span>Error loading data</span>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex-1 w-full relative min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Progress', value: totalDisposal, color: '#10B981' },
                            { name: 'Remaining', value: Math.max(0, totalArea - totalDisposal), color: '#E5E7EB' },
                          ]}
                          cx="50%"
                          cy="90%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percentage = totalArea > 0 ? (data.value / totalArea) * 100 : 0;
                              return (
                                <div className="rounded-md border bg-background p-3 text-sm shadow-lg">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="text-muted-foreground">
                                    {formatter.format(data.value)} Ha ({formatter.format(percentage)}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Gauge Needle/Indicator */}
                    <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {formatter.format(progressPercentage)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-1 pt-2 border-t">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatter.format(totalDisposal)} <span className="text-lg font-normal">Ha</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {formatter.format(totalArea)} Ha total
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Disposal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                        <span className="text-muted-foreground">Remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farm Progress Cards Inline */}
          {farms.map((farm, index) => {
            const totalFarmArea = data?.farms[farm] || 0;
            const disposalFarmArea = disposalData?.farms[farm] || 0;
            const farmProgress = totalFarmArea > 0 ? (disposalFarmArea / totalFarmArea) * 100 : 0;
            const color = colors[index % colors.length];

            return (
              <Card
                key={farm}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105 flex-1 min-w-[160px]"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {farm}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  {isLoading || disposalLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || disposalError ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Error</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {formatter.format(disposalFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{formatter.format(farmProgress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${farmProgress}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          / {formatter.format(totalFarmArea)} Ha
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function ClearingContent() {
  const steps = [
    {
      id: 'overview',
      label: 'Overview',
      type: 'start' as const,
      icon: ArrowLeft,
    },
    {
      id: 'tumbang',
      label: 'Tumbang (a)',
      step: 1,
      type: 'step' as const,
    },
    {
      id: 'stacking',
      label: 'Stacking (b)',
      step: 2,
      type: 'step' as const,
    },
    {
      id: 'disposal',
      label: 'Disposal (d)',
      step: 3,
      type: 'step' as const,
    },
    {
      id: 'preparation',
      label: 'Land Preparation',
      type: 'end' as const,
      icon: ArrowRight,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 pointer-events-none" />
          <CardContent className="relative">
            {/* Land Clearing Steps Timeline */}
            <div>
              <div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex-shrink-0 whitespace-nowrap">
                  Land Clearing Steps
                </h3>

                {/* Steps Container */}
                <div className="relative flex items-center justify-center flex-wrap gap-3 sm:gap-4">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="relative"
                      >
                        {/* Step Card */}
                        <div className="bg-blue-500 dark:bg-blue-600 rounded-lg px-4 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 min-w-[110px]">
                          <div className="flex items-center justify-center mb-1.5">
                            {step.type === 'start' || step.type === 'end' ? (
                              step.icon && (
                                <step.icon className="w-3.5 h-3.5 text-white" />
                              )
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {step.step}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-white text-center leading-tight">
                            {step.label}
                          </p>
                        </div>
                      </motion.div>

                      {/* Arrow between steps */}
                      {index < steps.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + 0.15 }}
                          className="flex-shrink-0"
                        >
                          <ChevronRight className="w-4 h-4 text-blue-400 dark:text-blue-500" />
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ArcGIS Dashboard Embeds */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ArcGISDashboardEmbed
            dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/dashboards/118f24e23de84824ab01b0565a6050c9"
            title="Land Clearing Dashboard"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ArcGISDashboardEmbed
            dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/webappviewer/index.html?id=9df4b5c46b30432b98d90ddb937cffeb"
            title="Land Clearing Web App Viewer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <ArcGISDashboardEmbed
            dashboardUrl="https://geoportal.mnmsugarhub.com/portal/apps/instant/filtergallery/index.html?appid=e9f8c21ab2b5459ebd821ad24f855299"
            title="Land Clearing Filter Gallery"
          />
        </motion.div>
      </div>
    </div>
  );
}

function PreparationContent() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Preparation
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitor land preparation activities and progress.
            </p>
            {/* Add more content here */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DevelopmentContent() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Development
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Track development activities and infrastructure progress.
            </p>
            {/* Add more content here */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function PlantedContent() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Planted
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              View planted areas and planting progress.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

