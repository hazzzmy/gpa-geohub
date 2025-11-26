'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ArrowLeft, ArrowRight, ChevronRight } from '@/lib/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { LayerConfig, MapExplorer } from '@/components/map';

export default function DevelopmentContent() {
  // Land Development queries - Get all task types
  const { data: taskTypesData, isLoading, error } = useQuery({
    queryKey: ['land-development-task-types'],
    queryFn: async () => {
      const response = await fetch('/api/land-development');
      if (!response.ok) {
        throw new Error('Failed to fetch land development task types');
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

  // Land Preparation all task types - to extract Finishing data
  const { data: landPreparationData, isLoading: landPreparationLoading, error: landPreparationError } = useQuery({
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
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract Finishing data from all task types (normalize task type name)
  const finishingData = React.useMemo(() => {
    if (!landPreparationData?.taskTypes) {
      return { totalFinishing: 0, farms: {} };
    }

    // Normalize task types to find Finishing
    type TaskData = { totalArea: number; farms: Record<string, number> };
    const finishing: TaskData = { totalArea: 0, farms: {} };
    let hasFinishing = false;
    
    Object.entries(landPreparationData.taskTypes).forEach(([key, value]) => {
      const taskData = value as TaskData;
      const normalizedKey = key.trim().toLowerCase();
      if (normalizedKey.includes('finishing')) {
        hasFinishing = true;
        finishing.totalArea += taskData.totalArea;
        Object.entries(taskData.farms).forEach(([farm, area]) => {
          finishing.farms[farm] = (finishing.farms[farm] || 0) + (area as number);
        });
      }
    });

    if (hasFinishing) {
      return {
        totalFinishing: finishing.totalArea,
        farms: finishing.farms,
      };
    }
    
    return {
      totalFinishing: 0,
      farms: {},
    };
  }, [landPreparationData]);

  const finishingLoading = landPreparationLoading;
  const finishingError = landPreparationError;

  // Monthly data for stacked bar chart
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['land-development-monthly'],
    queryFn: async () => {
      const response = await fetch('/api/land-development/monthly');
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

  // Fetch latest date from Land Development (Ripper 3 Leg)
  const { data: latestRipper3LegDate, isLoading: latestRipper3LegDateLoading, error: latestRipper3LegDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Ripper 3 Leg'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Ripper 3 Leg');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest ripper 3 leg date');
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

  // Fetch latest date from Land Development (Ripper 7 Leg)
  const { data: latestRipper7LegDate, isLoading: latestRipper7LegDateLoading, error: latestRipper7LegDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Ripper 7 Leg'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Ripper 7 Leg');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest ripper 7 leg date');
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

  // Fetch latest date from Land Development (Manual Picking)
  const { data: latestManualPickingDate, isLoading: latestManualPickingDateLoading, error: latestManualPickingDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Manual Picking'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Manual Picking');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest manual picking date');
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

  // Fetch latest date from Land Development (Offset Harrow)
  const { data: latestOffsetHarrowDate, isLoading: latestOffsetHarrowDateLoading, error: latestOffsetHarrowDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Offset Harrow'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Offset Harrow');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest offset harrow date');
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

  // Fetch latest date from Land Development (Grabber)
  const { data: latestGrabberDate, isLoading: latestGrabberDateLoading, error: latestGrabberDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Grabber'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Grabber');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest grabber date');
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

  // Fetch latest date from Land Development (Bed Ripper)
  const { data: latestBedRipperDate, isLoading: latestBedRipperDateLoading, error: latestBedRipperDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Bed Ripper'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Bed Ripper');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest bed ripper date');
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

  // Fetch latest date from Land Development (Ripper 1 Tyne)
  const { data: latestRipper1TyneDate, isLoading: latestRipper1TyneDateLoading, error: latestRipper1TyneDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Ripper 1 Tyne'],
    queryFn: async () => {
      const taskType = encodeURIComponent('Ripper 1 Tyne');
      const response = await fetch(`/api/land-development/latest-date?task_type=${taskType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest ripper 1 tyne date');
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
    'Ripper 3 Leg': '#3B82F6',
    'Ripper 7 Leg': '#10B981',
    'Manual Picking': '#F59E0B',
    'Offset Harrow': '#8B5CF6',
    'Grabber': '#EC4899',
    'Bed Ripper': '#84CC16',
    'Ripper 1 Tyne': '#3B82F6',
  };

  // Tab state for chart view - by task type
  const [selectedTaskType, setSelectedTaskType] = useState<string>('Ripper 3 Leg');

  // Extract task types from data and normalize
  const taskTypes = taskTypesData?.taskTypes || {};
  const normalizedTaskTypes: Record<string, { totalArea: number; farms: Record<string, number> }> = {};
  
  Object.entries(taskTypes).forEach(([key, value]) => {
    // Normalize key to handle case variations
    // Special handling for development task types
    let normalizedKey = key.trim();
    if (normalizedKey.toLowerCase().includes('ripper') && normalizedKey.toLowerCase().includes('3') && normalizedKey.toLowerCase().includes('leg')) {
      normalizedKey = 'Ripper 3 Leg';
    } else if (normalizedKey.toLowerCase().includes('ripper') && normalizedKey.toLowerCase().includes('7') && normalizedKey.toLowerCase().includes('leg')) {
      normalizedKey = 'Ripper 7 Leg';
    } else if (normalizedKey.toLowerCase().includes('manual') && normalizedKey.toLowerCase().includes('picking')) {
      normalizedKey = 'Manual Picking';
    } else if (normalizedKey.toLowerCase().includes('offset') && normalizedKey.toLowerCase().includes('harrow')) {
      normalizedKey = 'Offset Harrow';
    } else if (normalizedKey.toLowerCase().includes('grabber')) {
      normalizedKey = 'Grabber';
    } else if (normalizedKey.toLowerCase().includes('bed') && normalizedKey.toLowerCase().includes('ripper')) {
      normalizedKey = 'Bed Ripper';
    } else if (normalizedKey.toLowerCase().includes('ripper') && normalizedKey.toLowerCase().includes('1') && normalizedKey.toLowerCase().includes('tyne')) {
      normalizedKey = 'Ripper 1 Tyne';
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

  // Get available task types for tabs - include all task types
  // Order: Ripper 3 Leg (a), Ripper 7 Leg (b), Manual Picking (c), Offset Harrow (d), Grabber (e), Bed Ripper (f), Ripper 1 Tyne (g)
  const orderedTaskTypes = ['Ripper 3 Leg', 'Ripper 7 Leg', 'Manual Picking', 'Offset Harrow', 'Grabber', 'Bed Ripper', 'Ripper 1 Tyne'];
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
  // Order: Ripper 3 Leg (a), Ripper 7 Leg (b), Manual Picking (c), Offset Harrow (d), Grabber (e), Bed Ripper (f), Ripper 1 Tyne (g)
  const ripper3LegData = normalizedTaskTypes['Ripper 3 Leg'] || { totalArea: 0, farms: {} };
  const ripper7LegData = normalizedTaskTypes['Ripper 7 Leg'] || { totalArea: 0, farms: {} };
  const manualPickingData = normalizedTaskTypes['Manual Picking'] || { totalArea: 0, farms: {} };
  const offsetHarrowData = normalizedTaskTypes['Offset Harrow'] || { totalArea: 0, farms: {} };
  const grabberData = normalizedTaskTypes['Grabber'] || { totalArea: 0, farms: {} };
  const bedRipperData = normalizedTaskTypes['Bed Ripper'] || { totalArea: 0, farms: {} };
  const ripper1TyneData = normalizedTaskTypes['Ripper 1 Tyne'] || { totalArea: 0, farms: {} };

  // Calculate progress data
  // Note: totalArea from land clearing stats represents total farm area
  const totalArea = statsData?.totalArea || 0;
  const totalFinishing = finishingData?.totalFinishing || 0; // Total finishing from land preparation
  const totalBedRipper = bedRipperData.totalArea || 0;
  const progressPercentage = totalArea > 0 ? (totalBedRipper / totalArea) * 100 : 0;

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
        if (normalizedTaskType.toLowerCase().includes('ripper') && normalizedTaskType.toLowerCase().includes('3') && normalizedTaskType.toLowerCase().includes('leg')) {
          normalizedTaskType = 'Ripper 3 Leg';
        } else if (normalizedTaskType.toLowerCase().includes('ripper') && normalizedTaskType.toLowerCase().includes('7') && normalizedTaskType.toLowerCase().includes('leg')) {
          normalizedTaskType = 'Ripper 7 Leg';
        } else if (normalizedTaskType.toLowerCase().includes('manual') && normalizedTaskType.toLowerCase().includes('picking')) {
          normalizedTaskType = 'Manual Picking';
        } else if (normalizedTaskType.toLowerCase().includes('offset') && normalizedTaskType.toLowerCase().includes('harrow')) {
          normalizedTaskType = 'Offset Harrow';
        } else if (normalizedTaskType.toLowerCase().includes('grabber')) {
          normalizedTaskType = 'Grabber';
        } else if (normalizedTaskType.toLowerCase().includes('bed') && normalizedTaskType.toLowerCase().includes('ripper')) {
          normalizedTaskType = 'Bed Ripper';
        } else if (normalizedTaskType.toLowerCase().includes('ripper') && normalizedTaskType.toLowerCase().includes('1') && normalizedTaskType.toLowerCase().includes('tyne')) {
          normalizedTaskType = 'Ripper 1 Tyne';
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
      id: 'preparation',
      label: 'Land Preparation',
      type: 'start' as const,
      icon: ArrowLeft,
    },
    {
      id: 'ripper-3-leg',
      label: 'Ripper 3 Leg (a)',
      step: 7,
      type: 'step' as const,
    },
    {
      id: 'ripper-7-leg',
      label: 'Ripper 7 Leg (b)',
      step: 8,
      type: 'step' as const,
    },
    {
      id: 'manual-picking',
      label: 'Manual Picking (c)',
      step: 9,
      type: 'step' as const,
    },
    {
      id: 'offset-harrow',
      label: 'Offset Harrow (d)',
      step: 10,
      type: 'step' as const,
    },
    {
      id: 'grabber',
      label: 'Grabber (e)',
      step: 11,
      type: 'step' as const,
    },
    {
      id: 'bed-ripper',
      label: 'Bed Ripper (f)',
      step: 12,
      type: 'step' as const,
    },
    {
      id: 'ripper-1-tyne',
      label: 'Ripper 1 Tyne (g)',
      step: 13,
      type: 'step' as const,
    },
    {
      id: 'planted',
      label: 'Planted',
      type: 'end' as const,
      icon: ArrowRight,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Land Development Steps Timeline */}
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
                Land Development Steps
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

      {/* Land Development Progress Cards - Inline Layout - Memoized to prevent re-render on tab change */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Ripper 3 Leg Progress Card - Target refers to Finishing Land Preparation */}
            <ProgressCard
              title="Ripper 3 Leg"
              subtitle="Step 7: Ripper 3 Leg (a)"
              total={totalFinishing} // Total from Finishing Land Preparation
              completed={ripper3LegData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading || finishingLoading}
              error={!!(error || statsError || finishingError)}
              latestDate={latestRipper3LegDate ?? null}
              latestDateLoading={latestRipper3LegDateLoading}
              latestDateError={!!latestRipper3LegDateError}
            />

            {/* Ripper 7 Leg Progress Card */}
            <ProgressCard
              title="Ripper 7 Leg"
              subtitle="Step 8: Ripper 7 Leg (b)"
              total={ripper3LegData.totalArea}
              completed={ripper7LegData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestRipper7LegDate ?? null}
              latestDateLoading={latestRipper7LegDateLoading}
              latestDateError={!!latestRipper7LegDateError}
            />

            {/* Manual Picking Progress Card */}
            <ProgressCard
              title="Manual Picking"
              subtitle="Step 9: Manual Picking (c)"
              total={ripper7LegData.totalArea}
              completed={manualPickingData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestManualPickingDate ?? null}
              latestDateLoading={latestManualPickingDateLoading}
              latestDateError={!!latestManualPickingDateError}
            />

            {/* Offset Harrow Progress Card */}
            <ProgressCard
              title="Offset Harrow"
              subtitle="Step 10: Offset Harrow (d)"
              total={manualPickingData.totalArea}
              completed={offsetHarrowData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestOffsetHarrowDate ?? null}
              latestDateLoading={latestOffsetHarrowDateLoading}
              latestDateError={!!latestOffsetHarrowDateError}
            />

            {/* Grabber Progress Card */}
            <ProgressCard
              title="Grabber"
              subtitle="Step 11: Grabber (e)"
              total={offsetHarrowData.totalArea}
              completed={grabberData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestGrabberDate ?? null}
              latestDateLoading={latestGrabberDateLoading}
              latestDateError={!!latestGrabberDateError}
            />

            {/* Bed Ripper Progress Card */}
            <ProgressCard
              title="Bed Ripper"
              subtitle="Step 12: Bed Ripper (f)"
              total={grabberData.totalArea}
              completed={bedRipperData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestBedRipperDate ?? null}
              latestDateLoading={latestBedRipperDateLoading}
              latestDateError={!!latestBedRipperDateError}
            />

            {/* Ripper 1 Tyne Progress Card */}
            <ProgressCard
              title="Ripper 1 Tyne"
              subtitle="Step 13: Ripper 1 Tyne (g)"
              total={bedRipperData.totalArea}
              completed={ripper1TyneData.totalArea}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestRipper1TyneDate ?? null}
              latestDateLoading={latestRipper1TyneDateLoading}
              latestDateError={!!latestRipper1TyneDateError}
            />

            {/* Overall Progress Card */}
            <ProgressCard
              title="Overall Progress"
              subtitle="Total Bed Ripper vs Total Area"
              total={totalArea}
              completed={totalBedRipper}
              color="#3B82F6"
              isLoading={isLoading || statsLoading}
              error={!!(error || statsError)}
              latestDate={latestBedRipperDate ?? null}
              latestDateLoading={latestBedRipperDateLoading}
              latestDateError={!!latestBedRipperDateError}
            />
          </div>
        </motion.div>
      ), [
        totalFinishing,
        ripper3LegData.totalArea,
        ripper7LegData.totalArea,
        manualPickingData.totalArea,
        offsetHarrowData.totalArea,
        grabberData.totalArea,
        bedRipperData.totalArea,
        ripper1TyneData.totalArea,
        totalArea,
        totalBedRipper,
        isLoading,
        statsLoading,
        finishingLoading,
        error,
        statsError,
        finishingError
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
            const finishingFarmArea = finishingData?.farms[farm] || 0; // Finishing area per farm from land preparation
            const ripper3LegFarmArea = ripper3LegData.farms[farm] || 0;
            const ripper7LegFarmArea = ripper7LegData.farms[farm] || 0;
            const manualPickingFarmArea = manualPickingData.farms[farm] || 0;
            const offsetHarrowFarmArea = offsetHarrowData.farms[farm] || 0;
            const grabberFarmArea = grabberData.farms[farm] || 0;
            const bedRipperFarmArea = bedRipperData.farms[farm] || 0;
            const ripper1TyneFarmArea = ripper1TyneData.farms[farm] || 0;
            
            // All progress percentages refer to total farm area
            const ripper3LegProgressPercentage = totalFarmArea > 0 ? (ripper3LegFarmArea / totalFarmArea) * 100 : 0;
            const ripper7LegProgressPercentage = totalFarmArea > 0 ? (ripper7LegFarmArea / totalFarmArea) * 100 : 0;
            const manualPickingProgressPercentage = totalFarmArea > 0 ? (manualPickingFarmArea / totalFarmArea) * 100 : 0;
            const offsetHarrowProgressPercentage = totalFarmArea > 0 ? (offsetHarrowFarmArea / totalFarmArea) * 100 : 0;
            const grabberProgressPercentage = totalFarmArea > 0 ? (grabberFarmArea / totalFarmArea) * 100 : 0;
            const bedRipperProgressPercentage = totalFarmArea > 0 ? (bedRipperFarmArea / totalFarmArea) * 100 : 0;
            const ripper1TyneProgressPercentage = totalFarmArea > 0 ? (ripper1TyneFarmArea / totalFarmArea) * 100 : 0;
            
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
                  {isLoading || statsLoading || finishingLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || statsError || finishingError ? (
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

                      {/* Ripper 3 Leg Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Ripper 3 Leg</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(ripper3LegProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(ripper3LegFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${ripper3LegProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Ripper 7 Leg Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Ripper 7 Leg</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(ripper7LegProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(ripper7LegFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${ripper7LegProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Manual Picking Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Manual Picking</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(manualPickingProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(manualPickingFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${manualPickingProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Offset Harrow Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Offset Harrow</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(offsetHarrowProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(offsetHarrowFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${offsetHarrowProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Grabber Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Grabber</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(grabberProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(grabberFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${grabberProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Bed Ripper Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Bed Ripper</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(bedRipperProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(bedRipperFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${bedRipperProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Ripper 1 Tyne Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Ripper 1 Tyne</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(ripper1TyneProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(ripper1TyneFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${ripper1TyneProgressPercentage}%`,
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
        JSON.stringify(finishingData?.farms),
        JSON.stringify(ripper3LegData.farms),
        JSON.stringify(ripper7LegData.farms),
        JSON.stringify(manualPickingData.farms),
        JSON.stringify(offsetHarrowData.farms),
        JSON.stringify(grabberData.farms),
        JSON.stringify(bedRipperData.farms),
        JSON.stringify(ripper1TyneData.farms),
        isLoading,
        statsLoading,
        finishingLoading,
        error,
        statsError,
        finishingError
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
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 overflow-x-auto">
                  {availableTaskTypes.map((taskType) => (
                    <button
                      key={taskType}
                      onClick={() => setSelectedTaskType(taskType)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
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
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Development/Land_Development/MapServer",
            title: "Land Development",
            visible: true,
            sublayers: [
              {
                id: 17,
                title: "Land Development Progress",
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
