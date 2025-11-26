'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ArrowLeft, ArrowRight, ChevronRight } from '@/lib/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { LayerConfig, MapExplorer } from '@/components/map';

export default function PreparationContent() {
  // Land Preparation queries - Get all task types
  const { data: taskTypesData, isLoading, error } = useQuery({
    queryKey: ['land-preparation-task-types'],
    queryFn: async () => {
      const response = await fetch('/api/land-preparation');
      if (!response.ok) {
        throw new Error('Failed to fetch land preparation task types');
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

  // Land Clearing stats for total farm area (used as reference for all farms)
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

  // Land Clearing Disposal data - used as target for Underbrushing & Levelling
  const { data: disposalData, isLoading: disposalLoading, error: disposalError } = useQuery({
    queryKey: ['land-clearing-disposal'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/Disposal');
      if (!response.ok) {
        throw new Error('Failed to fetch disposal statistics');
      }
      const data = await response.json() as {
        success: boolean;
        taskType: string;
        totalArea: number;
        farms: Record<string, number>;
      };
      // Map totalArea to totalDisposal for consistency
      return {
        success: data.success,
        totalDisposal: data.totalArea,
        farms: data.farms,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Monthly data for stacked bar chart
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['land-preparation-monthly'],
    queryFn: async () => {
      const response = await fetch('/api/land-preparation/monthly');
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

  // Fetch latest date from Land Preparation (Underbrushing & Levelling)
  const { data: latestUnderbrushingDate, isLoading: latestUnderbrushingDateLoading, error: latestUnderbrushingDateError } = useQuery({
    queryKey: ['land-preparation-latest-date', 'Underbrushing & Levelling'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Underbrushing & Levelling');
      const response = await fetch(`/api/land-preparation/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest underbrushing date');
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

  // Fetch latest date from Land Preparation (Root Plough)
  const { data: latestRootPloughDate, isLoading: latestRootPloughDateLoading, error: latestRootPloughDateError } = useQuery({
    queryKey: ['land-preparation-latest-date', 'Root Plough'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Root Plough');
      const response = await fetch(`/api/land-preparation/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest root plough date');
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

  // Fetch latest date from Land Preparation (Stick Rake)
  const { data: latestStickRakeDate, isLoading: latestStickRakeDateLoading, error: latestStickRakeDateError } = useQuery({
    queryKey: ['land-preparation-latest-date', 'Stick Rake'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Stick Rake');
      const response = await fetch(`/api/land-preparation/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest stick rake date');
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

  // Fetch latest date from Land Preparation (Finishing)
  const { data: latestFinishingDate, isLoading: latestFinishingDateLoading, error: latestFinishingDateError } = useQuery({
    queryKey: ['land-preparation-latest-date', 'Finishing'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Finishing');
      const response = await fetch(`/api/land-preparation/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest finishing date');
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
    'Root Plough': '#3B82F6',
    'Stick Rake': '#10B981',
    'Underbrushing & Levelling': '#F59E0B',
    'Finishing': '#8B5CF6',
  };

  // Tab state for chart view - by task type
  const [selectedTaskType, setSelectedTaskType] = useState<string>('Underbrushing & Levelling');

  // Extract task types from data and normalize
  const taskTypes = taskTypesData?.taskTypes || {};
  const normalizedTaskTypes: Record<string, { totalArea: number; farms: Record<string, number> }> = {};
  
  Object.entries(taskTypes).forEach(([key, value]) => {
    // Normalize key to handle case variations
    // Special handling for "Underbrushing & Levelling" and other multi-word task types
    let normalizedKey = key.trim();
    if (normalizedKey.toLowerCase().includes('underbrushing') && normalizedKey.toLowerCase().includes('levelling')) {
      normalizedKey = 'Underbrushing & Levelling';
    } else if (normalizedKey.toLowerCase().includes('root') && normalizedKey.toLowerCase().includes('plough')) {
      normalizedKey = 'Root Plough';
    } else if (normalizedKey.toLowerCase().includes('stick') && normalizedKey.toLowerCase().includes('rake')) {
      normalizedKey = 'Stick Rake';
    } else if (normalizedKey.toLowerCase().includes('finishing')) {
      normalizedKey = 'Finishing';
    } else {
      // Default normalization: first letter uppercase, rest lowercase
      normalizedKey = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1).toLowerCase();
    }
    
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

  // Get available task types for tabs - include all task types including Finishing
  // Order: Underbrushing & Levelling (a), Root Plough (b), Stick Rake (c), Finishing (d)
  const orderedTaskTypes = ['Underbrushing & Levelling', 'Root Plough', 'Stick Rake', 'Finishing'];
  const availableTaskTypes = orderedTaskTypes.filter(taskType => 
    normalizedTaskTypes[taskType] !== undefined
  );

  // Set default selected task type if current one is not available
  React.useEffect(() => {
    if (availableTaskTypes.length > 0 && !availableTaskTypes.includes(selectedTaskType)) {
      setSelectedTaskType(availableTaskTypes[0]);
    }
  }, [availableTaskTypes, selectedTaskType]);

  // Get specific task types (case-insensitive lookup with normalized keys)
  // Order: Underbrushing & Levelling (a), Root Plough (b), Stick Rake (c), Finishing (d)
  const underbrushingData = normalizedTaskTypes['Underbrushing & Levelling'] || normalizedTaskTypes['Underbrushing & levelling'] || { totalArea: 0, farms: {} };
  const rootPloughData = normalizedTaskTypes['Root Plough'] || normalizedTaskTypes['Root plough'] || { totalArea: 0, farms: {} };
  const stickRakeData = normalizedTaskTypes['Stick Rake'] || normalizedTaskTypes['Stick rake'] || { totalArea: 0, farms: {} };
  const finishingData = normalizedTaskTypes['Finishing'] || { totalArea: 0, farms: {} };

  // Calculate progress data
  const totalArea = statsData?.totalArea || 0;
  const totalDisposal = disposalData?.totalDisposal || 0; // Total disposal from land clearing
  const totalFinishing = finishingData.totalArea || 0;
  const progressPercentage = totalArea > 0 ? (totalFinishing / totalArea) * 100 : 0;

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
      <Card className="border-slate-200 dark:border-slate-800  flex flex-col">
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
        // Normalize task type similar to the main normalization logic
        let normalizedTaskType = taskType.trim();
        if (normalizedTaskType.toLowerCase().includes('underbrushing') && normalizedTaskType.toLowerCase().includes('levelling')) {
          normalizedTaskType = 'Underbrushing & Levelling';
        } else if (normalizedTaskType.toLowerCase().includes('root') && normalizedTaskType.toLowerCase().includes('plough')) {
          normalizedTaskType = 'Root Plough';
        } else if (normalizedTaskType.toLowerCase().includes('stick') && normalizedTaskType.toLowerCase().includes('rake')) {
          normalizedTaskType = 'Stick Rake';
        } else if (normalizedTaskType.toLowerCase().includes('finishing')) {
          normalizedTaskType = 'Finishing';
        } else {
          normalizedTaskType = normalizedTaskType.charAt(0).toUpperCase() + normalizedTaskType.slice(1).toLowerCase();
        }
        
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

  const steps = [
    {
      id: 'clearing',
      label: 'Land Clearing',
      type: 'start' as const,
      icon: ArrowLeft,
    },
    {
      id: 'underbrushing',
      label: 'Underbrushing & Levelling (a)',
      step: 4,
      type: 'step' as const,
    },
    {
      id: 'root-plough',
      label: 'Root Plough (b)',
      step: 5,
      type: 'step' as const,
    },
    {
      id: 'stick-rake',
      label: 'Stick Rake (c)',
      step: 6,
      type: 'step' as const,
    },
    {
      id: 'finishing',
      label: 'Finishing (d)',
      step: 7,
      type: 'step' as const,
    },
    {
      id: 'development',
      label: 'Land Development',
      type: 'end' as const,
      icon: ArrowRight,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Land Preparation Steps Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800  transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" />
          <CardContent className="relative p-4">
            <div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0 whitespace-nowrap">
                Land Preparation Steps
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
                      <div className="bg-blue-500 dark:bg-blue-600 rounded-lg px-3 py-2 transition-all duration-300 min-w-[100px]">
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
                        <p className="text-xs font-medium text-white text-center leading-tight whitespace-pre-line">
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

      {/* Land Preparation Progress Cards - Inline Layout - Memoized to prevent re-render on tab change */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            {/* Underbrushing & Levelling Progress Card */}
            <ProgressCard
              title="Underbrushing"
              subtitle="Step 4: Underbrushing (a)"
              total={totalDisposal}
              completed={underbrushingData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading || disposalLoading}
              error={!!(error || statsError || disposalError)}
              latestDate={latestUnderbrushingDate ?? null}
              latestDateLoading={latestUnderbrushingDateLoading}
              latestDateError={!!latestUnderbrushingDateError}
            />

            {/* Root Plough Progress Card */}
            <ProgressCard
              title="Root Plough"
              subtitle="Step 5: Root Plough (b)"
              total={underbrushingData.totalArea}
              completed={rootPloughData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestRootPloughDate ?? null}
              latestDateLoading={latestRootPloughDateLoading}
              latestDateError={!!latestRootPloughDateError}
            />

            {/* Stick Rake Progress Card */}
            <ProgressCard
              title="Stick Rake"
              subtitle="Step 6: Stick Rake (c)"
              total={rootPloughData.totalArea}
              completed={stickRakeData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestStickRakeDate ?? null}
              latestDateLoading={latestStickRakeDateLoading}
              latestDateError={!!latestStickRakeDateError}
            />

            {/* Finishing Progress Card */}
            <ProgressCard
              title="Finishing"
              subtitle="Step 7: Finishing (d)"
              total={stickRakeData.totalArea}
              completed={finishingData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestFinishingDate ?? null}
              latestDateLoading={latestFinishingDateLoading}
              latestDateError={!!latestFinishingDateError}
            />

            {/* Overall Progress Card */}
            <ProgressCard
              title="Overall Progress"
              subtitle="Total Finishing vs Total Area"
              total={totalArea}
              completed={totalFinishing}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestFinishingDate ?? null}
              latestDateLoading={latestFinishingDateLoading}
              latestDateError={!!latestFinishingDateError}
            />
          </div>
        </motion.div>
      ), [
        totalDisposal,
        underbrushingData.totalArea,
        rootPloughData.totalArea,
        stickRakeData.totalArea,
        finishingData.totalArea,
        totalArea,
        totalFinishing,
        isLoading,
        statsLoading,
        disposalLoading,
        error,
        statsError,
        disposalError
      ])}

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
            const disposalFarmArea = disposalData?.farms[farm] || 0; // Disposal area per farm
            const rootPloughFarmArea = rootPloughData.farms[farm] || 0;
            const stickRakeFarmArea = stickRakeData.farms[farm] || 0;
            const underbrushingFarmArea = underbrushingData.farms[farm] || 0;
            const finishingFarmArea = finishingData.farms[farm] || 0;
            
            // Underbrushing & Levelling progress refers to disposal area (from land clearing)
            const underbrushingProgressPercentage = disposalFarmArea > 0 ? (underbrushingFarmArea / disposalFarmArea) * 100 : 0;
            // Other progress percentages refer to total farm area
            const rootPloughProgressPercentage = totalFarmArea > 0 ? (rootPloughFarmArea / totalFarmArea) * 100 : 0;
            const stickRakeProgressPercentage = totalFarmArea > 0 ? (stickRakeFarmArea / totalFarmArea) * 100 : 0;
            const finishingProgressPercentage = totalFarmArea > 0 ? (finishingFarmArea / totalFarmArea) * 100 : 0;
            
            const color = colors[index % colors.length];

            return (
              <Card
                key={farm}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105"
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
                  {isLoading || statsLoading || disposalLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || statsError || disposalError ? (
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

                      {/* Underbrushing & Levelling Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Underbrushing</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(underbrushingProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(underbrushingFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${underbrushingProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Root Plough Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Root Plough</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(rootPloughProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(rootPloughFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${rootPloughProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stick Rake Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Stick Rake</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(stickRakeProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(stickRakeFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stickRakeProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Finishing Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Finishing</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(finishingProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(finishingFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${finishingProgressPercentage}%`,
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
      ), [
        JSON.stringify(statsData?.farms),
        JSON.stringify(disposalData?.farms),
        JSON.stringify(underbrushingData.farms),
        JSON.stringify(rootPloughData.farms),
        JSON.stringify(stickRakeData.farms),
        JSON.stringify(finishingData.farms),
        isLoading,
        statsLoading,
        disposalLoading,
        error,
        statsError,
        disposalError
      ])}

      {/* Monthly Stacked Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-semibold">Monthly Area Distribution</CardTitle>
              {/* Tab Selector */}
              {availableTaskTypes.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {availableTaskTypes.map((taskType) => (
                    <button
                      key={taskType}
                      onClick={() => setSelectedTaskType(taskType)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                        selectedTaskType === taskType
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {taskType}
                    </button>
                  ))}
                </div>
              )}
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
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Preparation/Land_Preparation/MapServer",
            title: "Land Preparation",
            visible: true,
            sublayers: [
              {
                id: 7,
                title: "Land Preparation Progress",
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
            <Card className="bg-white  py-0 rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[650px] w-full">
                  <MapExplorer
                    layers={mapLayers}
                    center={[140.587582, -8.2400545]}
                    zoom={12}
                    serverUrl="https://geoportal.mnmsugarhub.com/server/rest/services"
                    showLayerList={true}
                    showLegend={true}
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
