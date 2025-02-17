"use client";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { subDays, addDays, addYears, format } from "date-fns";

interface AreaChartProps {
  data: { [key: string]: any }[]; // Pre-filtered data from parent
  xKey: string;
  yKeys: { key: string; label: string; color: string }[];
  filter: string;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function AreaChart({ data, xKey, yKeys, filter, currentDate }: AreaChartProps) {
  const [currentPage, setCurrentPage] = useState<Date>(new Date());
  const handlePrevious = () => {
    setCurrentPage(prev => {
      if (!(prev instanceof Date)) return new Date(); // Fallback for safety
      if (filter === "hourly") return subDays(prev, 1);
      if (filter === "daily") return subDays(prev, 7);
      if (filter === "monthly") return addYears(prev, -1);
      return prev;
    });
  };
  
  const handleNext = () => {
    setCurrentPage(prev => {
      if (!(prev instanceof Date)) return new Date(); // Fallback for safety
      if (filter === "hourly") return addDays(prev, 1);
      if (filter === "daily") return addDays(prev, 7);
      if (filter === "monthly") return addYears(prev, 1);
      return prev;
    });
  };
  

  const formatLabel = () => {
    if (filter === "hourly") return format(currentDate, "yyyy-MM-dd");
    if (filter === "daily") return `${format(currentDate, "MMMM")} - Week ${Math.ceil(currentDate.getDate() / 7)}`;
    if (filter === "monthly") return format(currentDate, "yyyy");
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Showing statistics over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={370}>
          <RechartsAreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickMargin={4} />
            <YAxis />
            <Tooltip />
            {yKeys.map((yKey) => (
              <Area key={yKey.key} dataKey={yKey.key} type="monotone" fill={yKey.color} fillOpacity={0} stroke={yKey.color} name={yKey.label} />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
        <Pagination className="mt-4">
          <div className="w-full flex items-center justify-between">
            <PaginationContent className="flex justify-center flex-grow">
              <PaginationItem>
                <PaginationLink className="p-3 w-[300px]" isActive>
                  {formatLabel()}
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </div>
        </Pagination>
      </CardContent>
    </Card>
  );
}
