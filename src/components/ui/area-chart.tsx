// src/components/ui/area-chart.tsx

"use client";
import { useState, useEffect } from "react";
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

import { subDays, startOfMonth, format, addYears, addDays } from "date-fns";

interface AreaChartProps {
  data: { [key: string]: any }[]; // Dynamic structure of data
  xKey: string; // X-Axis key
  yKeys: { key: string; label: string; color: string }[]; // Y-Axis key, label, and color
  filter: string; // The filter type to adapt the graph (hourly, daily, monthly)
}

export function AreaChart({ data, xKey, yKeys, filter }: AreaChartProps) {
  const [currentPage, setCurrentPage] = useState(new Date());

  const [chartData, setChartData] = useState<{ [key: string]: any }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const formattedDate = format(currentPage, "yyyy-MM-dd");
      const queryParam = `?filter=${filter}&date=${formattedDate}`;
      const response = await fetch(`/api/admin/analytics${queryParam}`);
      const result = await response.json();
      setChartData(result.userTrends || []);
    }

    fetchData();
  }, [currentPage, filter]);

  const generateXAxisLabels = () => {
    if (filter === "hourly") {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (filter === "daily") {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else if (filter === "monthly") {
      return Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("default", { month: "long" })
      );
    }
    return [];
  };

  const xAxisLabels = generateXAxisLabels();
  const filledData = xAxisLabels.map((label) => {
    const existingData = data.find((d) => d[xKey] === label);
    return (
      existingData || { [xKey]: label, totalUsers: 0, verifiedUsers: 0, winners: 0, losers: 0 }
    );
  });

  const formatLabel = () => {
    if (filter === "hourly") {
      return format(currentPage, "yyyy-MM-dd");
    } else if (filter === "daily") {
      const weekOfMonth = Math.ceil(currentPage.getDate() / 7);
      return `${format(currentPage, "MMMM")} - Week ${weekOfMonth}`;
    } else if (filter === "monthly") {
      return format(currentPage, "yyyy");
    }
    return "";
  };

  const handlePrevious = () => {
    if (filter === "hourly") {
      setCurrentPage((prev) => subDays(prev, 1));
    } else if (filter === "daily") {
      setCurrentPage((prev) => subDays(prev, 7));
    } else if (filter === "monthly") {
      setCurrentPage((prev) => addYears(prev, -1));
    }
  };

  const handleNext = () => {
    if (filter === "hourly") {
      setCurrentPage((prev) => addDays(prev, 1));
    } else if (filter === "daily") {
      setCurrentPage((prev) => addDays(prev, 7));
    } else if (filter === "monthly") {
      setCurrentPage((prev) => addYears(prev, 1));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Showing statistics over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={370}>
          <RechartsAreaChart data={filledData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickMargin={4} />
            <YAxis />
            <Tooltip />
            {yKeys.map((yKey) => (
              <Area
                key={yKey.key}
                dataKey={yKey.key}
                type="monotone"
                fill={yKey.color}
                fillOpacity={0}
                stroke={yKey.color}
                name={yKey.label}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
        <Pagination className="mt-4">
          <div className="w-full flex items-center justify-between">
            {/* Previous Button: Aligns at the start */}
            <PaginationPrevious
              className="bg-blue-400 hover:bg-blue-200 cursor-pointer"
              onClick={handlePrevious}
            />
            
            {/* Pagination Content: Centered Label */}
            <PaginationContent className="flex justify-center flex-grow">
              <PaginationItem>
                <PaginationLink className="p-3 w-auto" isActive>{formatLabel()}</PaginationLink>
              </PaginationItem>
            </PaginationContent>
            
            {/* Next Button: Aligns at the end */}
            <PaginationNext
              className="bg-blue-400 hover:bg-blue-200 cursor-pointer"
              onClick={handleNext}
            />
          </div>
        </Pagination>
      </CardContent>
    </Card>
  );
}
