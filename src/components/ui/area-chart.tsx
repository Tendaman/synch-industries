// src/components/ui/area-chart.tsx

"use client";

import { TrendingUp } from "lucide-react";
// Alias the recharts AreaChart to avoid conflict with local AreaChart component
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the types for the incoming props
interface AreaChartProps {
  data: { [key: string]: any }[]; // Data in dynamic format, allowing any structure
  xKey: string; // Key for the x-axis (e.g., "date" or "month")
  yKeys: { key: string; label: string; color: string }[]; // Dynamic yKeys with label and color
}

export function AreaChart({ data, xKey, yKeys }: AreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth Over Time</CardTitle>
        <CardDescription>Showing statistics over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full h-[370px]">
          <RechartsAreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xKey} // Use dynamic xKey
              tickLine={true}
              axisLine={true}
              tickMargin={4}
              tickFormatter={(value) => value.slice(0, 3)} // Format the tick labels if needed
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            {yKeys.map((yKey) => (
              <Area
                key={yKey.key}
                dataKey={yKey.key}
                type="linear"
                fill={yKey.color}
                fillOpacity={0}
                stroke={yKey.color}
                name={yKey.label}
              />
            ))}
          </RechartsAreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
