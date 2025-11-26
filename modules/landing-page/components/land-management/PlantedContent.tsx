'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ArrowLeft, ArrowRight, ChevronRight } from '@/lib/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { LayerConfig, MapExplorer } from '@/components/map';

export default function PlantedContent() {
  const [selectedRotation, setSelectedRotation] = useState<'0' | '1'>('0');
  // Planted queries - Rotation 0
  const { data: plantedData0, isLoading: isLoading0, error: error0 } = useQuery({
    queryKey: ['planted-data-rotation-0'],
    queryFn: async () => {
      const response = await fetch('/api/planted/0');
      if (!response.ok) {
        throw new Error('Failed to fetch planted rotation 0 data');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Planted queries - Rotation 1
  const { data: plantedData1, isLoading: isLoading1, error: error1 } = useQuery({
    queryKey: ['planted-data-rotation-1'],
    queryFn: async () => {
      const response = await fetch('/api/planted/1');
      if (!response.ok) {
        throw new Error('Failed to fetch planted rotation 1 data');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combined loading and error states
  const isLoading = isLoading0 || isLoading1;
  const error = error0 || error1;

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

  // Land Development all task types - to extract Bed Ripper data
  const { data: landDevelopmentData, isLoading: landDevelopmentLoading, error: landDevelopmentError } = useQuery({
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
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract Bed Ripper data from all task types (normalize task type name)
  const bedRipperData = React.useMemo(() => {
    if (!landDevelopmentData?.taskTypes) {
      return { totalBedRipper: 0, farms: {} };
    }

    // Normalize task types to find Bed Ripper
    const bedRipper: { totalArea: number; farms: Record<string, number> } = { totalArea: 0, farms: {} };
    
    Object.entries(landDevelopmentData.taskTypes).forEach(([key, value]) => {
      const normalizedKey = key.trim().toLowerCase();
      if (normalizedKey.includes('bed') && normalizedKey.includes('ripper')) {
        const taskData = value as { totalArea: number; farms: Record<string, number> };
        bedRipper.totalArea += taskData.totalArea;
        Object.entries(taskData.farms).forEach(([farm, area]) => {
          bedRipper.farms[farm] = (bedRipper.farms[farm] || 0) + (area as number);
        });
      }
    });

    return {
      totalBedRipper: bedRipper.totalArea,
      farms: bedRipper.farms,
    };
  }, [landDevelopmentData]);

  const bedRipperLoading = landDevelopmentLoading;
  const bedRipperError = landDevelopmentError;

  // Monthly data for rotation 0
  const { data: monthlyData0, isLoading: monthlyLoading0, error: monthlyError0 } = useQuery({
    queryKey: ['planted-monthly-rotation-0'],
    queryFn: async () => {
      const response = await fetch('/api/planted/monthly?rotation=0');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly statistics for rotation 0');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        monthly: Array<{
          month: string;
          year: number;
          monthNumber: number;
          totalArea: number;
          cumulativeTotal: number;
          farms: Record<string, number>;
        }>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Monthly data for rotation 1
  const { data: monthlyData1, isLoading: monthlyLoading1, error: monthlyError1 } = useQuery({
    queryKey: ['planted-monthly-rotation-1'],
    queryFn: async () => {
      const response = await fetch('/api/planted/monthly?rotation=1');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly statistics for rotation 1');
      }
      return response.json() as Promise<{
        success: boolean;
        rotation: string;
        monthly: Array<{
          month: string;
          year: number;
          monthNumber: number;
          totalArea: number;
          cumulativeTotal: number;
          farms: Record<string, number>;
        }>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current monthly data based on selected rotation
  const monthlyData = selectedRotation === '0' ? monthlyData0 : monthlyData1;
  const monthlyLoading = selectedRotation === '0' ? monthlyLoading0 : monthlyLoading1;
  const monthlyError = selectedRotation === '0' ? monthlyError0 : monthlyError1;

  // Fetch latest date from Planted Area
  const { data: latestPlantedDate, isLoading: latestPlantedDateLoading, error: latestPlantedDateError } = useQuery({
    queryKey: ['planted-latest-date'],
    queryFn: async () => {
      const response = await fetch('/api/planted/latest-date');
      if (!response.ok) {
        throw new Error('Failed to fetch latest planted date');
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

  // Calculate progress data
  // Note: totalArea from land clearing stats represents total farm area
  const totalPlanted0 = plantedData0?.totalArea || 0;
  const totalPlanted1 = plantedData1?.totalArea || 0;
  const totalPlanted = totalPlanted0 + totalPlanted1; // Combined total
  const totalBedRipper = bedRipperData?.totalBedRipper || 0; // Total bed ripper from land development
  const totalArea = statsData?.totalArea || 0;

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

  // Transform monthly data for stacked bar chart by farm
  const chartData = React.useMemo(() => {
    if (!monthlyData?.monthly) return [];

    return monthlyData.monthly.map((monthData) => {
      const chartItem: Record<string, any> = {
        month: monthData.month,
        monthLabel: new Date(monthData.year, monthData.monthNumber - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      // Add farm data
      farms.forEach((farm) => {
        chartItem[farm] = monthData.farms[farm] || 0;
      });

      return chartItem;
    });
  }, [monthlyData]);

  // Chart configuration
  const chartKeys = farms;
  const chartColors = colors;

  const steps = [
    {
      id: 'development',
      label: 'Land Development',
      type: 'start' as const,
      icon: ArrowLeft,
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
      {/* Planted Steps Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" />
          <CardContent className="relative p-4">
            <div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0 whitespace-nowrap">
                Planted Steps
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
                      <div className="bg-emerald-500 dark:bg-emerald-600 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 min-w-[100px]">
                        <div className="flex items-center justify-center mb-1">
                          {step.icon && (
                            <step.icon className="w-3 h-3 text-white" />
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
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Planted Progress Cards - Memoized to prevent re-render on tab change */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {/* Rotation 0 - Planted vs Bed Ripper */}
            <ProgressCard
              title="Rotation 0"
              subtitle="Planted vs Bed Ripper"
              total={totalBedRipper}
              completed={totalPlanted0}
              color="#10B981"
              isLoading={isLoading0 || statsLoading || bedRipperLoading}
              error={!!(error0 || statsError || bedRipperError)}
              latestDate={latestPlantedDate ?? null}
              latestDateLoading={latestPlantedDateLoading}
              latestDateError={!!latestPlantedDateError}
            />

            {/* Rotation 1 - Planted vs Rotation 0 */}
            <ProgressCard
              title="Rotation 1"
              subtitle="Rotation 1 vs Rotation 0"
              total={totalPlanted0}
              completed={totalPlanted1}
              color="#059669"
              isLoading={isLoading0 || isLoading1}
              error={!!(error0 || error1)}
              latestDate={latestPlantedDate ?? null}
              latestDateLoading={latestPlantedDateLoading}
              latestDateError={!!latestPlantedDateError}
            />

            {/* Rotation 0 - Overall Progress */}
            <ProgressCard
              title="Overall Progress"
              subtitle="Planted (Rotation 0) vs Total Area"
              total={totalArea}
              completed={totalPlanted0}
              color="#10B981"
              isLoading={isLoading0 || statsLoading}
              error={!!(error0 || statsError)}
              latestDate={latestPlantedDate ?? null}
              latestDateLoading={latestPlantedDateLoading}
              latestDateError={!!latestPlantedDateError}
            />
          </div>
        </motion.div>
      ), [
        totalBedRipper,
        totalPlanted0,
        totalPlanted1,
        totalArea,
        isLoading0,
        isLoading1,
        statsLoading,
        bedRipperLoading,
        error0,
        error1,
        statsError,
        bedRipperError
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
            const plantedFarmArea0 = plantedData0?.farms[farm] || 0;
            const plantedFarmArea1 = plantedData1?.farms[farm] || 0;
            
            // Progress percentage refers to total farm area
            const plantedProgressPercentage0 = totalFarmArea > 0 ? (plantedFarmArea0 / totalFarmArea) * 100 : 0;
            const plantedProgressPercentage1 = totalFarmArea > 0 ? (plantedFarmArea1 / totalFarmArea) * 100 : 0;
            
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
                  {isLoading || statsLoading || bedRipperLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || statsError || bedRipperError ? (
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

                      {/* Rotation 0 Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Rotation 0</span>
                          <span className="text-xs font-semibold" style={{ color: '#10B981' }}>{formatter.format(plantedProgressPercentage0)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                            {formatter.format(plantedFarmArea0)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${plantedProgressPercentage0}%`,
                              backgroundColor: '#10B981',
                            }}
                          />
                        </div>
                      </div>

                      {/* Rotation 1 Progress */}
                      <div className="pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Rotation 1</span>
                          <span className="text-xs font-semibold" style={{ color: '#059669' }}>{formatter.format(plantedProgressPercentage1)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                            {formatter.format(plantedFarmArea1)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${plantedProgressPercentage1}%`,
                              backgroundColor: '#059669',
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
        JSON.stringify(bedRipperData?.farms),
        JSON.stringify(plantedData0?.farms),
        JSON.stringify(plantedData1?.farms),
        isLoading0,
        isLoading1,
        statsLoading,
        bedRipperLoading,
        error0,
        error1,
        statsError,
        bedRipperError
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
              {/* Tab Selector for Rotation */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setSelectedRotation('0')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedRotation === '0'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Rotation 0
                </button>
                <button
                  onClick={() => setSelectedRotation('1')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedRotation === '1'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Rotation 1
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stacked bar chart showing planted area distribution per farm by month (Rotation {selectedRotation})
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
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/MapServer",
            title: "Planted",
            visible: true,
            sublayers: [
              {
                id: 7,
                title: "Planted",
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
