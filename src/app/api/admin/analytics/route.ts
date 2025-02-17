//src\app\api\admin\analytics\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays, startOfMonth, format, startOfDay, parseISO } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "hourly"; // Default to 'hourly'
    const dateParam = searchParams.get("date"); // Get date from query params
    const now = dateParam ? parseISO(dateParam) : new Date();

    let dateFilter = {};
    if (filter === "hourly") {
      dateFilter = { createdAt: { gte: startOfDay(now), lt: subDays(startOfDay(now), -1) } }; // Last 24 hours
    } else if (filter === "daily") {
      dateFilter = { createdAt: { gte: subDays(now, 168) } }; // Last 7 days
    } else if (filter === "monthly") {
      dateFilter = { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } }; // From start of this month
    }

    // Fetch aggregated stats for pie chart
    const [totalUsers, verifiedUsers, totalCodes, totalWinningCodes] = await Promise.all([
      prisma.user.count({ where: dateFilter }),
      prisma.user.count({ where: { isVerified: true, ...dateFilter } }),
      prisma.genCode.count({ where: dateFilter }),
      prisma.genCode.count({ where: { isWinner: true, ...dateFilter } }),
    ]);

    const totalLosingCodes = totalCodes - totalWinningCodes;

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
    

    // Initialize trends map with default values
    let trendsMap = new Map();
    if (filter === "hourly") {
      for (let i = 0; i < 24; i++) {
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

    const userRecords = await prisma.user.findMany({
      where: dateFilter,
      select: { createdAt: true, isVerified: true },
    });

    // Fetching code trends
    const codeRecords = await prisma.genCode.findMany({
      where: dateFilter,
      select: { createdAt: true, isWinner: true },
    });

    // Process trends
    userRecords.forEach(record => {
      let formattedDate = "";
      if (filter === "hourly") {
        formattedDate = format(record.createdAt, "H:00");
      } else if (filter === "daily") {
        formattedDate = format(record.createdAt, "EEE");
      } else if (filter === "monthly") {
        formattedDate = format(record.createdAt, "MMMM");
      }

      if (trendsMap.has(formattedDate)) {
        const trendData = trendsMap.get(formattedDate);
        trendData.totalUsers++;
        if (record.isVerified) trendData.verifiedUsers++;
        trendsMap.set(formattedDate, trendData);
      }
    });

    codeRecords.forEach(record => {
      let formattedDate = "";
      if (filter === "hourly") {
        formattedDate = format(record.createdAt, "H:00");
      } else if (filter === "daily") {
        formattedDate = format(record.createdAt, "EEE");
      } else if (filter === "monthly") {
        formattedDate = format(record.createdAt, "MMMM");
      }

      if (trendsMap.has(formattedDate)) {
        const trendData = trendsMap.get(formattedDate);
        if (record.isWinner) trendData.winners++;
        else trendData.losers++;
        trendsMap.set(formattedDate, trendData);
      }
    });

    return NextResponse.json(
      {
        totalUsers,
        verifiedUsers,
        totalCodes,
        totalWinningCodes,
        totalLosingCodes,
        winnerCodes: winnerCodes.map(code => ({ code: code.generatedCode })),
        winnerUsers,
        hasData: totalUsers > 0 || totalCodes > 0,
        userTrends: Array.from(trendsMap.values()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
