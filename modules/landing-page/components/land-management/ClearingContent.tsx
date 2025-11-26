'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ArrowLeft, ArrowRight, ChevronRight } from '@/lib/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import MapExplorer, { LayerConfig } from '@/components/map/MapExplorer';

export default function ClearingContent() {
  // Land Clearing queries - Get all task types
  const { data: taskTypesData, isLoading, error } = useQuery({
    queryKey: ['land-clearing-task-types'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing');
      if (!response.ok) {
        throw new Error('Failed to fetch land clearing task types');
      }
      return response.json() as Promise<{
        success: boolean;
        taskTypes: Record<string, {
          totalArea: number;
          farms: Record<string, number>;
        }>;
        rawFeatures?: any[];
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Land Clearing stats for total area
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
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

  // Monthly data for stacked bar chart
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['land-clearing-monthly'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/monthly');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        monthly: Array<{
          month: string;
          year: number;
          monthNumber: number;
          totalArea: number;
          cumulativeTotal: number;
          taskTypes: Record<string, {
            totalArea: number;
            farms: Record<string, number>;
          }>;
        }>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch latest date from Land Clearing (Tumbang)
  const { data: latestTumbangDate, isLoading: latestTumbangDateLoading, error: latestTumbangDateError } = useQuery({
    queryKey: ['land-clearing-latest-date', 'Tumbang'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/latest-date?task_type=Tumbang');
      if (!response.ok) {
        throw new Error('Failed to fetch latest tumbang date');
      }
      const data = await response.json() as {
        success: boolean;
        latestDate?: string | null;
        timestamp?: number;
      };

      if (!data.success || !data.latestDate) {
        return null;
      }

      return new Date(data.latestDate);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch latest date from Land Clearing (Stacking)
  const { data: latestStackingDate, isLoading: latestStackingDateLoading, error: latestStackingDateError } = useQuery({
    queryKey: ['land-clearing-latest-date', 'Stacking'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/latest-date?task_type=Stacking');
      if (!response.ok) {
        throw new Error('Failed to fetch latest stacking date');
      }
      const data = await response.json() as {
        success: boolean;
        latestDate?: string | null;
        timestamp?: number;
      };

      if (!data.success || !data.latestDate) {
        return null;
      }

      return new Date(data.latestDate);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch latest date from Land Clearing (Disposal)
  const { data: latestDisposalDate, isLoading: latestDisposalDateLoading, error: latestDisposalDateError } = useQuery({
    queryKey: ['land-clearing-latest-date', 'Disposal'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/latest-date?task_type=Disposal');
      if (!response.ok) {
        throw new Error('Failed to fetch latest disposal date');
      }
      const data = await response.json() as {
        success: boolean;
        latestDate?: string | null;
        timestamp?: number;
      };

      if (!data.success || !data.latestDate) {
        return null;
      }

      return new Date(data.latestDate);
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  });
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  const farms = ['F1', 'F2', 'F3', 'F4', 'F5'] as const;
  // F1: Purple, F2: Green, F3: Pink, F4: Lime Green, F5: Orange
  const colors = ['#8B5CF6', '#10B981', '#EC4899', '#84CC16', '#F59E0B'];
  
  // Task type colors
  const taskTypeColors: Record<string, string> = {
    'Tumbang': '#3B82F6',
    'Stacking': '#10B981',
    'Disposal': '#F59E0B',
  };

  // Tab state for chart view - by task type
  const [selectedTaskType, setSelectedTaskType] = useState<'Tumbang' | 'Stacking' | 'Disposal'>('Tumbang');

  // Transform monthly data for stacked bar chart by farm for selected task type
  const chartData = React.useMemo(() => {
    if (!monthlyData?.monthly) return [];

    return monthlyData.monthly.map((monthData) => {
      const chartItem: Record<string, any> = {
        month: monthData.month,
        monthLabel: new Date(monthData.year, monthData.monthNumber - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      // Find the selected task type data (normalize case)
      let selectedTaskTypeData: { totalArea: number; farms: Record<string, number> } | null = null;
      
      Object.entries(monthData.taskTypes).forEach(([taskType, taskData]) => {
        const normalizedTaskType = taskType.charAt(0).toUpperCase() + taskType.slice(1).toLowerCase();
        if (normalizedTaskType === selectedTaskType) {
          selectedTaskTypeData = taskData;
        }
      });

      // Add farm data for selected task type
      farms.forEach((farm) => {
        chartItem[farm] = selectedTaskTypeData?.farms[farm] || 0;
      });

      return chartItem;
    });
  }, [monthlyData, selectedTaskType]);

  // Chart configuration
  const chartKeys = farms;
  const chartColors = colors;

  // Extract task types data (normalize case - combine "Stacking" and "STACKING")
  const taskTypes = taskTypesData?.taskTypes || {};
  const normalizedTaskTypes: Record<string, { totalArea: number; farms: Record<string, number> }> = {};
  
  Object.entries(taskTypes).forEach(([key, value]) => {
    // Normalize key to handle case variations (e.g., "Stacking" and "STACKING")
    // Convert to title case: first letter uppercase, rest lowercase
    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    
    if (!normalizedTaskTypes[normalizedKey]) {
      normalizedTaskTypes[normalizedKey] = { totalArea: 0, farms: {} };
    }
    
    // Sum up total area
    normalizedTaskTypes[normalizedKey].totalArea += value.totalArea;
    
    // Merge farms data
    Object.entries(value.farms).forEach(([farm, area]) => {
      normalizedTaskTypes[normalizedKey].farms[farm] = (normalizedTaskTypes[normalizedKey].farms[farm] || 0) + area;
    });
  });

  // Get specific task types (case-insensitive lookup with normalized keys)
  const tumbangData = normalizedTaskTypes['Tumbang'] || { totalArea: 0, farms: {} };
  const stackingData = normalizedTaskTypes['Stacking'] || { totalArea: 0, farms: {} };
  const disposalData = normalizedTaskTypes['Disposal'] || { totalArea: 0, farms: {} };

  // Calculate progress data
  const totalArea = statsData?.totalArea || 0;
  const totalDisposal = disposalData.totalArea || 0;
  const progressPercentage = totalArea > 0 ? (totalDisposal / totalArea) * 100 : 0;

  // Helper function to create progress card - memoized to prevent unnecessary re-renders
  const ProgressCard = memo(({ 
    title, 
    subtitle, 
    total, 
    completed, 
    color, 
    isLoading: cardLoading, 
    error: cardError,
    latestDate,
    latestDateLoading,
    latestDateError,
  }: {
    title: string;
    subtitle?: string;
    total: number;
    completed: number;
    color: string;
    isLoading?: boolean;
    error?: boolean;
    latestDate?: Date | null;
    latestDateLoading?: boolean;
    latestDateError?: boolean;
  }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <Card className="border-slate-200 dark:border-slate-800 flex flex-col rounded-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {cardLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : cardError ? (
            <div className="flex items-center justify-center h-[200px] text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Error loading data</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="w-full relative h-[90px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Progress', value: completed, color },
                        { name: 'Remaining', value: Math.max(0, total - completed), color: '#E5E7EB' },
                      ]}
                      cx="50%"
                      cy="90%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={color} />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        
                        const data = payload[0].payload;
                        const dataPercentage = total > 0 ? (data.value / total) * 100 : 0;
                        const isProgress = data.name === 'Progress';
                        const tooltipColor = isProgress ? color : '#9CA3AF';
                        
                        return (
                          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1.5 shadow-md text-xs">
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tooltipColor }}
                              />
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {formatter.format(data.value)} Ha
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                ({formatter.format(dataPercentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      }}
                      cursor={{ fill: 'transparent' }}
                      animationDuration={150}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Gauge Needle/Indicator */}
                <div className="absolute bottom-[8%] left-1/2 transform -translate-x-1/2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatter.format(percentage)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1 pt-2 border-t">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatter.format(completed)} <span className="text-base font-normal">Ha</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatter.format(total)} Ha total
                </p>
                {/* <div className="flex items-center justify-center gap-4 mt-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground">Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-muted-foreground">Remaining</span>
                  </div>
                </div> */}
                {(typeof latestDate !== 'undefined' ||
                  typeof latestDateLoading !== 'undefined' ||
                  typeof latestDateError !== 'undefined') && (
                  <div className="pt-3 border-t text-center text-xs text-muted-foreground">
                    {latestDateLoading ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Fetching latest update...</span>
                      </div>
                    ) : latestDateError ? (
                      <span>Latest update unavailable</span>
                    ) : latestDate ? (
                      <span>Latest update: {dateFormatter.format(latestDate)}</span>
                    ) : (
                      <span>Latest update: -</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  });

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
    <div className="space-y-4">
      {/* Land Clearing Steps Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden rounded-lg">
          <div className="absolute inset-0 pointer-events-none" />
          <CardContent className="relative p-4">
            <div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0 whitespace-nowrap">
                Land Clearing Steps
              </h3>

              {/* Steps Container */}
              <div className="relative flex items-center justify-center flex-wrap gap-2 sm:gap-3">
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
                      <div className="bg-blue-500 dark:bg-blue-600 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 min-w-[100px]">
                        <div className="flex items-center justify-center mb-1">
                          {step.type === 'start' || step.type === 'end' ? (
                            step.icon && (
                              <step.icon className="w-3 h-3 text-white" />
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
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 dark:text-blue-500" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Land Clearing Progress Cards - Inline Layout - Memoized to prevent re-render on tab change */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Tumbang Progress Card */}
            <ProgressCard
              title="Tumbang"
              subtitle="Step 1: Tumbang (a)"
              total={totalArea}
              completed={tumbangData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestTumbangDate ?? null}
              latestDateLoading={latestTumbangDateLoading}
              latestDateError={!!latestTumbangDateError}
            />

            {/* Stacking Progress Card */}
            <ProgressCard
              title="Stacking"
              subtitle="Step 2: Stacking (b)"
              total={tumbangData.totalArea}
              completed={stackingData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestStackingDate ?? null}
              latestDateLoading={latestStackingDateLoading}
              latestDateError={!!latestStackingDateError}
            />

            {/* Disposal Progress Card */}
            <ProgressCard
              title="Disposal"
              subtitle="Step 3: Disposal (d)"
              total={stackingData.totalArea}
              completed={disposalData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestDisposalDate ?? null}
              latestDateLoading={latestDisposalDateLoading}
              latestDateError={!!latestDisposalDateError}
            />

            {/* Overall Progress Card */}
            <ProgressCard
              title="Overall Progress"
              subtitle="Total Disposal vs Total Area"
              total={totalArea}
              completed={totalDisposal}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestDisposalDate ?? null}
              latestDateLoading={latestDisposalDateLoading}
              latestDateError={!!latestDisposalDateError}
            />
          </div>
        </motion.div>
      ), [totalArea, tumbangData.totalArea, stackingData.totalArea, disposalData.totalArea, totalDisposal, isLoading, statsLoading, error, statsError])}

      {/* Farm Cards - Grid Layout - Memoized to prevent re-render on tab change */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {farms.map((farm, index) => {
            const totalFarmArea = statsData?.farms[farm] || 0;
            const tumbangFarmArea = tumbangData.farms[farm] || 0;
            const stackingFarmArea = stackingData.farms[farm] || 0;
            const disposalFarmArea = disposalData.farms[farm] || 0;
            
            const tumbangProgressPercentage = totalFarmArea > 0 ? (tumbangFarmArea / totalFarmArea) * 100 : 0;
            const stackingProgressPercentage = totalFarmArea > 0 ? (stackingFarmArea / totalFarmArea) * 100 : 0;
            const disposalProgressPercentage = totalFarmArea > 0 ? (disposalFarmArea / totalFarmArea) * 100 : 0;
            
            const color = colors[index % colors.length];

            return (
              <Card
                key={farm}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {farm}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  {isLoading || statsLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || statsError ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Error</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Total Area */}
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                          {formatter.format(totalFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                        </p>
                      </div>

                      {/* Tumbang Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Tumbang</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(tumbangProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(tumbangFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${tumbangProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stacking Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Stacking</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(stackingProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(stackingFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stackingProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Disposal Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Disposal</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(disposalProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(disposalFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${disposalProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
      ), [statsData?.farms, tumbangData.farms, stackingData.farms, disposalData.farms, isLoading, statsLoading, error, statsError])}

      {/* Monthly Stacked Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-semibold">Monthly Area Distribution</CardTitle>
              {/* Tab Selector */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setSelectedTaskType('Tumbang')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedTaskType === 'Tumbang'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tumbang
                </button>
                <button
                  onClick={() => setSelectedTaskType('Stacking')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedTaskType === 'Stacking'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Stacking
                </button>
                <button
                  onClick={() => setSelectedTaskType('Disposal')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedTaskType === 'Disposal'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Disposal
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stacked bar chart showing {selectedTaskType} area distribution per farm by month
            </p>
          </CardHeader>
          <CardContent className="pb-4">
            {monthlyLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : monthlyError ? (
              <div className="flex items-center justify-center h-[400px] text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>Error loading monthly data</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <span>No data available</span>
              </div>
            ) : (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="monthLabel"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                      stroke="#64748B"
                    />
                    <YAxis
                      label={{ value: 'Area (Ha)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                      stroke="#64748B"
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        
                        const total = payload.reduce((sum, entry) => sum + (entry.value as number || 0), 0);
                        
                        return (
                          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-2 shadow-md">
                            <p className="font-semibold text-sm mb-2 text-slate-900 dark:text-white">
                              {payload[0].payload.monthLabel}
                            </p>
                            <div className="space-y-1">
                              {payload.map((entry, index) => {
                                const label = entry.dataKey as string;
                                const value = entry.value as number;
                                const percentage = total > 0 ? (value / total) * 100 : 0;
                                return (
                                  <div key={index} className="flex items-center justify-between gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-900 dark:text-white">
                                        {formatter.format(value)} Ha
                                      </span>
                                      <span className="text-slate-500 dark:text-slate-400">
                                        ({formatter.format(percentage)}%)
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-slate-700 dark:text-slate-300">Total</span>
                                  <span className="text-slate-900 dark:text-white">
                                    {formatter.format(total)} Ha
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px', paddingBottom: '0px' }}
                      iconType="circle"
                      formatter={(value) => value}
                    />
                    {chartKeys.map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="area"
                        fill={chartColors[index]}
                        name={key}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Land Clearing Map - Memoized to prevent re-render on tab change */}
      {useMemo(() => {
        const mapLayers: LayerConfig[] = [
          {
            type: "web-tile",
            urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={col}&y={row}&z={level}",
            title: "Google Satellite",
            subDomains: ["mt0", "mt1", "mt2", "mt3"],
            copyright: "Google Satellite",
          },
          {
            type: "map-image",
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Aerial_Photo/Land_Clearing_GPA_/MapServer",
            title: "Land Clearing Aerial Photo",
            visible: true,
          },
          {
            type: "map-image",
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Clearing/Land_Clearing/MapServer",
            title: "Land Clearing",
            visible: true,
            sublayers: [
              {
                id: 7,
                title: "LC Block Target",
                visible: true,
              },
              {
                id: 8,
                title: "LC Progress",
                visible: true,
              },
            ],
          },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="bg-white py-0 rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[650px] w-full">
                  <MapExplorer
                    layers={mapLayers}
                    center={[140.587582, -8.2400545]}
                    zoom={12}
                    serverUrl="https://geoportal.mnmsugarhub.com/server/rest/services"
                    showLayerList={true}
                    showLegend={true}
                    layerListPosition="top-right"
                    legendPosition="top-left"
                    includeLandUnitLayer={true}
                    enablePopup={true}
                    className="rounded-lg"
                    enableLandUnitFilter={true}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      }, [])}
    </div>
  );
}

