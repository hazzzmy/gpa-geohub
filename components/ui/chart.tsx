"use client"

import * as React from "react"
import {
  CartesianGrid,
  Label,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
    icon?: React.ComponentType<{ className?: string }>
  }
>

const ChartContext = React.createContext<ChartConfig | null>(null)

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn("flex w-full flex-col gap-2", className)}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function useChartConfig() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer")
  }
  return context
}

export function ChartTooltip({
  content,
  ...props
}: React.ComponentProps<typeof RechartsTooltip>) {
  return (
    <RechartsTooltip
      cursor={{ fill: "transparent" }}
      content={content ?? <ChartTooltipContent />}
      {...props}
    />
  )
}

export interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean
  formatter?: (value: number) => React.ReactNode
}

export function ChartTooltipContent({
  className,
  hideLabel = false,
  formatter,
  ...props
}: ChartTooltipContentProps) {
  const config = useChartConfig()
  const payload = (props as TooltipProps<number, string>).payload ?? []

  if (!payload.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-md",
        className,
      )}
    >
      {payload.map((item, index) => {
        const rawPayload = item.payload as Record<string, unknown> | undefined
        const key =
          (rawPayload?.key as string | undefined) ??
          item.dataKey?.toString() ??
          `item-${index}`
        const chartItem = config[key]
        const label =
          chartItem?.label ??
          (rawPayload?.label as string | undefined) ??
          item.name ??
          key
        const value = formatter ? formatter(Number(item.value)) : item.value
        const color =
          chartItem?.color ??
          (typeof item.color === "string" ? item.color : undefined) ??
          ((rawPayload?.fill as string | undefined) ??
            (rawPayload?.color as string | undefined))

        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium text-foreground">
              {hideLabel ? value : `${label}: ${value}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export {
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  Label,
  CartesianGrid,
  ReferenceLine,
  Cell,
}

