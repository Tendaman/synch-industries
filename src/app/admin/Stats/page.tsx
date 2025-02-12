//src\app\admin\Stats\page.tsx

"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AreaChart } from "@/components/ui/area-chart"; 
import { subDays, startOfMonth, getHours, getDay, getMonth, format, addYears, addDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define types for the incoming stats and trends data
interface Trend {
  date: string;
  totalUsers: number;
  verifiedUsers: number;
  winners: number;
  losers: number;
}

interface Stats {
  totalCodes: number;
  totalWinningCodes: number;
  totalLosingCodes: number;
  totalUsers: number;
  verifiedUsers: number;
  winners: number;
  losers: number;
  hasData: boolean;
  userTrends: Trend[];
  winnerCodes: { code: number }[]; 
  winnerUsers: { name: string; surname: string; email: string; date: string }[]; // Adding winner users data
}

export default function WinningPage() {
  const [stats, setStats] = useState<Stats>({
    totalCodes: 0,
    totalWinningCodes: 0,
    totalLosingCodes: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    winners: 0,
    losers: 0,
    hasData: false,
    userTrends: [],
    winnerCodes: [],
    winnerUsers: [],
  });

  const [filter, setFilter] = useState("hourly");
  const [dateLabel, setDateLabel] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/admin/analytics?filter=${filter}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats({
          totalCodes: data.totalCodes || 0,
          totalWinningCodes: data.totalWinningCodes || 0,
          totalLosingCodes: data.totalLosingCodes || 0,
          totalUsers: data.totalUsers || 0,
          verifiedUsers: data.verifiedUsers || 0,
          winners: data.winners || 0,
          losers: data.losers || 0,
          hasData: data.hasData,
          userTrends: Array.isArray(data.userTrends) ? data.userTrends : [],
          winnerCodes: data.winnerCodes || [],
          winnerUsers: data.winnerUsers || [],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, userTrends: [] }));
      }
    }

    fetchStats();
  }, [filter, currentDate]);

  useEffect(() => {
    const now = new Date();
    if (filter === "hourly") {
      setDateLabel(now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + ` - ${now.getHours()}:00`);
    } else if (filter === "daily") {
      setDateLabel(now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    } else if (filter === "monthly") {
      setDateLabel(now.toLocaleDateString("en-US", { month: "long" }));
    } else {
      setDateLabel(""); // No label for "Overall"
    }
  }, [filter]);

  // Pie chart data
  const data = {
    labels: ["Total Codes", "Winning Codes", "Losing Codes"],
    datasets: [
      {
        label: "Code Distribution",
        data: stats.hasData ? [stats.totalCodes, stats.totalWinningCodes, stats.totalLosingCodes] : [0, 0, 0],
        backgroundColor: ["#36A2EB", "#4CAF50", "#FF3D67"],
        hoverOffset: 4,
      },
    ],
  };

  // Formatting the data for area chart
  const generateXAxisLabels = () => {
    if (filter === "hourly") {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (filter === "daily") {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else if (filter === "monthly") {
      return Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" }));
    }
    return [];
  };

  const xAxisLabels = generateXAxisLabels();
  const areaChartData = xAxisLabels.map(label => {
    const existingData = stats.userTrends.find(trend => trend.date === label);
    return existingData || { date: label, totalUsers: 0, verifiedUsers: 0, winners: 0, losers: 0 };
  });

  console.log("Formatted Area Chart Data:", areaChartData);

  return (
    <>
      <div className="flex">
        <div className="flex flex-col p-6">
          <h1 className="text-2xl font-bold mb-4">Statistics & Analytics</h1>

          {/* Pie Chart */}
          <Card className="w-80 h-80 mt-6 p-4 flex items-center justify-center shadow-md">
            {stats.hasData ? (
              <Pie data={data} />
            ) : (
              <p className="text-gray-500 text-center">No Data Available</p>
            )}
          </Card>

          <Card className="mt-6 p-4 w-80 shadow-md">
            <p className="text-lg font-semibold">📊 Statistics</p>
            <p className="mt-2"><strong>Total Codes:</strong> {stats.totalCodes}</p>
            <p><strong>Winning Codes:</strong> {stats.totalWinningCodes}</p>
            <p><strong>Losing Codes:</strong> {stats.totalLosingCodes}</p>
          </Card>
        </div>

        <div className="w-full flex flex-col p-6">
          <div className="flex">
            <h2 className="text-2xl font-bold mb-4">User Growth Over Time</h2>
            <div className="flex items-center space-x-4 mb-4 ml-4">
              <Select onValueChange={(value: string) => setFilter(value)} defaultValue={filter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AreaChart
            data={areaChartData}
            xKey="date"
            yKeys={[
              { key: "totalUsers", label: "Total Users", color: "blue" },
              { key: "verifiedUsers", label: "Verified Users", color: "green" },
              { key: "winners", label: "Winners", color: "gold" },
              { key: "losers", label: "Losers", color: "red" },
            ]}
            filter={filter} />
        </div>
      </div>
      <div>
        {/* Two Tables */}
        <div className="flex space-x-8 mt-6">
          {/* Winner Codes Table */}
          <Card className="w-1/3 p-4 shadow-md">
            <p className="text-lg font-semibold">Winner Codes for Today</p>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.winnerCodes.length > 0 ? (
                  stats.winnerCodes.map((code, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{code.code}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Winners Table */}
          <Card className="w-full p-4 shadow-md">
            <p className="text-lg font-semibold">Winners</p>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Surname</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.winnerUsers.length > 0 ? (
                  stats.winnerUsers.map((winner, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{winner.name}</TableCell>
                      <TableCell>{winner.surname}</TableCell>
                      <TableCell>{winner.email}</TableCell>
                      <TableCell>{winner.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
