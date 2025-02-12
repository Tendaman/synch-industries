//src\app\api\admin\analytics\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays, startOfMonth, format, startOfDay } from "date-fns";

const prisma = new PrismaClient();

interface HistoryData {
  isVerified?: boolean;
  isWinner?: boolean;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "hourly"; // Default to 'hourly'

    let dateFilter = {};
    const now = new Date();

    if (filter === "hourly") {
      dateFilter = { createdAt: { gte: subDays(now, 1) } }; // Last 24 hours
    } else if (filter === "daily") {
      dateFilter = { createdAt: { gte: subDays(now, 7) } }; // Last 7 days
    } else if (filter === "monthly") {
      dateFilter = { createdAt: { gte: startOfMonth(now) } }; // From start of this month
    }

    // Fetch aggregated stats for pie chart
    const [totalUsers, verifiedUsers, totalCodes, totalWinningCodes] = await Promise.all([
      prisma.history.count({ where: { model: "User", ...dateFilter } }),
      prisma.history.count({ where: { model: "User", data: { path: ["isVerified"], equals: true }, ...dateFilter } }),
      prisma.history.count({ where: { model: "GenCode", ...dateFilter } }),
      prisma.history.count({ where: { model: "GenCode", data: { path: ["isWinner"], equals: true }, ...dateFilter } }),
    ]);

    const winnerCodes = await prisma.genCode.findMany({
      where: { isWinner: true, createdAt: { gte: startOfDay(now) } },
      select: { generatedCode: true },
    });

    const winnerUsers = await prisma.winner.findMany({
      where: { wonAt: { gte: startOfDay(now) } },
      select: { 
        name: true, 
        surname: true, 
        email: true, 
        wonAt: true  // This field belongs to the Winner model
      },
    });
    

    // Fetch records for time-based trends
    const historyRecords = await prisma.history.findMany({
      where: {
        model: { in: ["User", "GenCode"] },
        ...dateFilter,
      },
      select: {
        createdAt: true,
        model: true,
        data: true,
      },
    });

    // Initialize trends map with default values
    let trendsMap = new Map();

    if (filter === "hourly") {
      for (let i = 0; i < 24; i += 4) {
        const label = `${i}:00`;
        trendsMap.set(label, { date: label, totalUsers: 0, verifiedUsers: 0, winners: 0, losers: 0 });
      }
    } else if (filter === "daily") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.forEach(day => {
        trendsMap.set(day, { date: day, totalUsers: 0, verifiedUsers: 0, winners: 0, losers: 0 });
      });
    } else if (filter === "monthly") {
      for (let i = 0; i < 12; i++) {
        const month = format(new Date(0, i), "MMMM");
        trendsMap.set(month, { date: month, totalUsers: 0, verifiedUsers: 0, winners: 0, losers: 0 });
      }
    }

    // Process history records and update trends map
    historyRecords.forEach(record => {
      let formattedDate = "";
      const data = record.data as HistoryData | null;

      if (filter === "hourly") {
        formattedDate = `${new Date(record.createdAt).getHours()}:00`;
      } else if (filter === "daily") {
        formattedDate = format(record.createdAt, "EEE");
      } else if (filter === "monthly") {
        formattedDate = format(record.createdAt, "MMMM");
      }

      if (trendsMap.has(formattedDate)) {
        const trendData = trendsMap.get(formattedDate);
        if (record.model === "User") {
          trendData.totalUsers++;
          if (data?.isVerified) trendData.verifiedUsers++;
        } else if (record.model === "GenCode") {
          if (data?.isWinner) trendData.winners++;
          else trendData.losers++;
        }
        trendsMap.set(formattedDate, trendData);
      }
    });

    const totalLosingCodes = totalCodes - totalWinningCodes;

    return NextResponse.json(
      {
        // Pie Chart Data
        totalUsers,
        verifiedUsers,
        totalCodes,
        totalWinningCodes,
        totalLosingCodes,
        winnerCodes: winnerCodes.map(code => ({ code: code.generatedCode })),
        winnerUsers,
        hasData: totalUsers > 0 || totalCodes > 0,
        // Area Chart Data
        userTrends: Array.from(trendsMap.values()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
