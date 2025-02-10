//src\app\admin\Winningpage\page.tsx

"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { AreaChart } from "@/components/ui/area-chart"; 

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function WinningPage() {
  const [stats, setStats] = useState({
    totalCodes: 0,
    totalWinningCodes: 0,
    totalLosingCodes: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    winners: 0,
    losers: 0,
    userTrends: [],
  });

  const [filter, setFilter] = useState("overall");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch(`/api/admin/analytics?filter=${filter}`);
      const data = await res.json();
      setStats(data);
    }

    fetchStats();
  }, [filter]);

  // Update the date label when filter changes
  useEffect(() => {
   const now = new Date();
   if (filter === "daily") {
    setDateLabel(now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })); // e.g., "February 6, 2025"
   } else if (filter === "monthly") {
    setDateLabel(now.toLocaleDateString("en-US", { month: "long" })); // e.g., "February 2025"
   } else {
    setDateLabel(""); // No label for "Overall"
   }
  }, [filter]);

  // Chart data
  const data = {
    labels: ["Total Codes", "Winning Codes", "Losing Codes"],
    datasets: [
      {
        label: "Code Distribution",
        data: [stats.totalCodes, stats.totalWinningCodes, stats.totalLosingCodes],
        backgroundColor: ["#36A2EB", "#4CAF50", "#FF3D67"],
        hoverOffset: 4,
      },
    ],
  };

  const areaChartData = [
    { date: "Jan", totalUsers: 50, verifiedUsers: 30, winners: 10, losers: 20 },
    { date: "Feb", totalUsers: 70, verifiedUsers: 50, winners: 20, losers: 30 },
    { date: "Mar", totalUsers: 100, verifiedUsers: 80, winners: 30, losers: 50 },
    { date: "Apr", totalUsers: 120, verifiedUsers: 100, winners: 40, losers: 60 },
    { date: "May", totalUsers: 150, verifiedUsers: 120, winners: 50, losers: 70 },
  ];

  return (
    <div className="flex">
      <div className="flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-4">Statistics & Analytics</h1>

        {/* Dropdown for filtering */}
        <div className="flex items-center space-x-4">
          <Select onValueChange={(value: string) => setFilter(value)} defaultValue={filter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {/* Display Date/Month if applicable */}
          {dateLabel && (
            <span className="text-lg font-semibold text-gray-600">{dateLabel}</span>
          )}
        </div>

        {/* Pie Chart */}
        <Card className="w-80 h-80 mt-6 p-4 flex items-center justify-center shadow-md">
          <Pie data={data} />
        </Card>

        {/* Display Stats */}
        <Card className="mt-6 p-4 w-80 shadow-md">
          <p className="text-lg font-semibold">📊 Statistics</p>
          <p className="mt-2"><strong>Total Codes:</strong> {stats.totalCodes}</p>
          <p><strong>Winning Codes:</strong> {stats.totalWinningCodes}</p>
          <p><strong>Losing Codes:</strong> {stats.totalLosingCodes}</p>
        </Card>
      </div>

      {/* Right Side: Area Chart */}
      <div className="w-full flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-4">User Growth Over Time</h2>
          <AreaChart
            data={areaChartData}
            xKey="date"
            yKeys={[
              { key: "totalUsers", label: "Total Users", color: "blue" },
              { key: "verifiedUsers", label: "Verified Users", color: "green" },
              { key: "winners", label: "Winners", color: "gold" },
              { key: "losers", label: "Losers", color: "red" },
            ]}
          />
      </div>
    </div>
  );
}
