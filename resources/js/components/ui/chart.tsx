import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
>

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig
  children: React.ReactElement
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const chartId = React.useId()
    const containerId = `chart-${id || chartId.replace(/:/g, "")}`

    return (
      <div
        ref={ref}
        id={containerId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-grid_line]:stroke-border/20",
          className
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(
                ([key, item]) =>
                  `#${containerId} { --color-${key}: ${item.color || "#000"}; }`
              )
              .join("\n"),
          }}
        />
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

function ChartTooltip({ content, ...props }: any) {
  return null
}

function ChartTooltipContent({ active, payload, label, labelFormatter, indicator = "dot" }: any) {
  if (!active || !payload?.length) return null

  const formattedLabel = labelFormatter ? labelFormatter(label) : label

  return (
    <div className="rounded-base border-2 border-border bg-background p-2 shadow-shadow text-xs font-bold text-foreground">
      {formattedLabel && <div className="mb-1 border-b border-border pb-1">{formattedLabel}</div>}
      <div className="space-y-1">
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full border border-border"
                style={{ backgroundColor: item.color || item.fill }}
              />
              <span className="capitalize text-foreground/80">{item.name}:</span>
            </div>
            <span className="font-black">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartLegend({ content, ...props }: any) {
  return null
}

function ChartLegendContent({ payload }: any) {
  if (!payload?.length) return null

  return (
    <div className="flex items-center justify-center gap-4 pt-3 text-xs font-bold text-foreground">
      {payload.map((item: any, idx: number) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 border-2 border-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
