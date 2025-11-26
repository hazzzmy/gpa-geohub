'use client';

import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import MapExplorer, { LayerConfig } from '@/components/map/MapExplorer';

export default function OverviewContent() {
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
      // Map totalArea to totalDisposal for backward compatibility
      return {
        success: data.success,
        totalDisposal: data.totalArea,
        farms: data.farms,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch latest date from Land Clearing (Disposal)
  const { data: latestDisposalDate, isLoading: latestDateLoading, error: latestDateError } = useQuery({
    queryKey: ['land-clearing-latest-date', 'Disposal'],
    queryFn: async () => {
      const response = await fetch('/api/land-clearing/latest-date?task_type=Disposal');
      if (!response.ok) {
        throw new Error('Failed to fetch latest land clearing date');
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

  // Land Preparation queries
  const { data: preparationStatsData, isLoading: preparationStatsLoading, error: preparationStatsError } = useQuery({
    queryKey: ['land-preparation-stats'],
    queryFn: async () => {
      const response = await fetch('/api/land-preparation/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch land preparation statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: finishingData, isLoading: finishingLoading, error: finishingError } = useQuery({
    queryKey: ['land-preparation-finishing'],
    queryFn: async () => {
      const response = await fetch('/api/land-preparation/Finishing');
      if (!response.ok) {
        throw new Error('Failed to fetch finishing statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        taskType: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch latest date from Land Preparation (Finishing)
  const { data: latestFinishingDate, isLoading: latestFinishingDateLoading, error: latestFinishingDateError } = useQuery({
    queryKey: ['land-preparation-latest-date', 'Finishing'],
    queryFn: async () => {
      const response = await fetch('/api/land-preparation/latest-date?task_type=Finishing');
      if (!response.ok) {
        throw new Error('Failed to fetch latest land preparation date');
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

  // Land Development queries
  const { data: developmentStatsData, isLoading: developmentStatsLoading, error: developmentStatsError } = useQuery({
    queryKey: ['land-development-stats'],
    queryFn: async () => {
      const response = await fetch('/api/land-development/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch land development statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: bedRipperData, isLoading: bedRipperLoading, error: bedRipperError } = useQuery({
    queryKey: ['land-development-bed-ripper'],
    queryFn: async () => {
      const response = await fetch('/api/land-development/Bed Ripper');
      if (!response.ok) {
        throw new Error('Failed to fetch bed ripper statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        taskType: string;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch latest date from Land Development (Bed Ripper)
  const { data: latestBedRipperDate, isLoading: latestBedRipperDateLoading, error: latestBedRipperDateError } = useQuery({
    queryKey: ['land-development-latest-date', 'Bed Ripper'],
    queryFn: async () => {
      const response = await fetch('/api/land-development/latest-date?task_type=Bed Ripper');
      if (!response.ok) {
        throw new Error('Failed to fetch latest land development date');
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

  // Planted queries
  const { data: plantedData, isLoading: plantedLoading, error: plantedError } = useQuery({
    queryKey: ['planted-stats'],
    queryFn: async () => {
      const response = await fetch('/api/planted/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch planted statistics');
      }
      return response.json() as Promise<{
        success: boolean;
        totalArea: number;
        farms: Record<string, number>;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
  const totalArea = data?.totalArea || 0;
  const totalDisposal = disposalData?.totalDisposal || 0;
  const progressPercentage = totalArea > 0 ? (totalDisposal / totalArea) * 100 : 0;

  // Land Preparation data
  // Maximum is the progress from land clearing (total disposal)
  const preparationTotal = totalDisposal || 0;
  const preparationFinishing = finishingData?.totalArea || 0;

  // Land Development data
  // Maximum is the progress from land preparation (total finishing)
  const developmentTotal = preparationFinishing || 0;
  const developmentBedRipper = bedRipperData?.totalArea || 0;

  // Planted data
  // Maximum is the progress from land development (total bed ripper)
  const plantedTotal = developmentBedRipper || 0;
  const plantedArea = plantedData?.totalArea || 0;

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
      <Card className="border-slate-200 dark:border-slate-800 flex flex-col">
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

  return (
    <div className="space-y-6">
      {/* Total Area and Progress Cards - Grid Layout - Memoized to prevent re-render */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full">
            {/* Total Area Card - Takes 1 column */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
              <CardContent className="p-6 h-full flex items-center">
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
                    <p className="text-3xl lg:text-4xl font-bold text-white">
                      {formatter.format(data?.totalArea || 0)} <span className="text-lg lg:text-xl font-normal">Ha</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Cards - Takes 4 columns */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Land Clearing Progress */}
              <ProgressCard
                title="Land Clearing"
                subtitle="Based on Wood Disposal"
                total={totalArea}
                completed={totalDisposal}
                color="#3B82F6"
                isLoading={isLoading || disposalLoading}
                error={!!(error || disposalError)}
                latestDate={latestDisposalDate ?? null}
                latestDateLoading={latestDateLoading}
                latestDateError={!!latestDateError}
              />

              {/* Land Preparation Progress */}
              <ProgressCard
                title="Land Preparation"
                subtitle="Based on Finishing"
                total={preparationTotal}
                completed={preparationFinishing}
                color="#3B82F6"
                isLoading={preparationStatsLoading || finishingLoading}
                error={!!(preparationStatsError || finishingError)}
                latestDate={latestFinishingDate ?? null}
                latestDateLoading={latestFinishingDateLoading}
                latestDateError={!!latestFinishingDateError}
              />

              {/* Land Development Progress */}
              <ProgressCard
                title="Land Development"
                subtitle="Based on Bed Ripper"
                total={developmentTotal}
                completed={developmentBedRipper}
                color="#3B82F6"
                isLoading={finishingLoading || bedRipperLoading}
                error={!!(finishingError || bedRipperError)}
                latestDate={latestBedRipperDate ?? null}
                latestDateLoading={latestBedRipperDateLoading}
                latestDateError={!!latestBedRipperDateError}
              />

              {/* Planted Progress */}
              <ProgressCard
                title="Planted"
                subtitle="Based on Planted Area"
                total={plantedTotal}
                completed={plantedArea}
                color="#3B82F6"
                isLoading={bedRipperLoading || plantedLoading}
                error={!!(bedRipperError || plantedError)}
                latestDate={latestPlantedDate ?? null}
                latestDateLoading={latestPlantedDateLoading}
                latestDateError={!!latestPlantedDateError}
              />
            </div>
          </div>
        </motion.div>
      ), [
        totalArea, 
        totalDisposal, 
        preparationTotal, 
        preparationFinishing, 
        developmentTotal, 
        developmentBedRipper, 
        plantedTotal, 
        plantedArea,
        isLoading, 
        disposalLoading, 
        preparationStatsLoading, 
        finishingLoading, 
        bedRipperLoading, 
        plantedLoading,
        error, 
        disposalError, 
        preparationStatsError, 
        finishingError, 
        bedRipperError, 
        plantedError,
        data?.totalArea,
        latestDisposalDate,
        latestDateLoading,
        latestDateError,
      ])}

      {/* Farm Cards - Grid Layout - Memoized to prevent re-render */}
      {useMemo(() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {farms.map((farm, index) => {
            const totalFarmArea = data?.farms[farm] || 0;
            const disposalFarmArea = disposalData?.farms[farm] || 0;
            const finishingFarmArea = finishingData?.farms[farm] || 0;
            const bedRipperFarmArea = bedRipperData?.farms[farm] || 0;
            const plantedFarmArea = plantedData?.farms[farm] || 0;
            // All progress percentages are based on total farm area
            const clearingProgressPercentage = totalFarmArea > 0 ? (disposalFarmArea / totalFarmArea) * 100 : 0;
            const preparationProgressPercentage = totalFarmArea > 0 ? (finishingFarmArea / totalFarmArea) * 100 : 0;
            const developmentProgressPercentage = totalFarmArea > 0 ? (bedRipperFarmArea / totalFarmArea) * 100 : 0;
            const plantedProgressPercentage = totalFarmArea > 0 ? (plantedFarmArea / totalFarmArea) * 100 : 0;
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
                  {isLoading || disposalLoading || finishingLoading || bedRipperLoading || plantedLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error || disposalError || finishingError || bedRipperError || plantedError ? (
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

                      {/* Clearing Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Clearing</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(clearingProgressPercentage)}%</span>
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
                              width: `${clearingProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Preparation Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Preparation</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(preparationProgressPercentage)}%</span>
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
                              width: `${preparationProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Development Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Development</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(developmentProgressPercentage)}%</span>
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
                              width: `${developmentProgressPercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Planted Progress */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Planted</span>
                          <span className="text-xs font-semibold" style={{ color: color }}>{formatter.format(plantedProgressPercentage)}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: color }}>
                            {formatter.format(plantedFarmArea)} <span className="text-xs font-normal text-muted-foreground">Ha</span>
                          </p>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${plantedProgressPercentage}%`,
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
        JSON.stringify(data?.farms),
        JSON.stringify(disposalData?.farms),
        JSON.stringify(finishingData?.farms),
        JSON.stringify(bedRipperData?.farms),
        JSON.stringify(plantedData?.farms),
        isLoading,
        disposalLoading,
        finishingLoading,
        bedRipperLoading,
        plantedLoading,
        error,
        disposalError,
        finishingError,
        bedRipperError,
        plantedError
      ])}

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
                id: 8,
                title: "Land Clearing Progress",
                visible: true,
                definitionExpression: "task_type = 'Disposal'",
              },
            ],
          },
          {
            type: "map-image",
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Preparation/Land_Preparation/MapServer",
            title: "Land Preparation",
            visible: true,
            sublayers: [
              {
                id: 7,
                title: "Land Preparation",
                visible: true,
                definitionExpression: "task_type = 'Finishing'",
              },
            ],
          },
          {
            type: "map-image",
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Land_Development/Land_Development/MapServer",
            title: "Land Development",
            visible: true,
            sublayers: [
              {
                id: 17,
                title: "Land Development",
                visible: true,
                definitionExpression: "task_type = 'Bed Ripper'",
              },
            ],
          },
          {
            type: "map-image",
            url: "https://geoportal.mnmsugarhub.com/server/rest/services/Planted_Area/Planted_Area/MapServer",
            title: "Planted Area",
            visible: true,
            sublayers: [
              {
                id: 7,
                title: "Planted Area",
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

