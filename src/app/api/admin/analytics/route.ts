import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays, startOfMonth } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Parse the filter type from query params
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "overall"; // Default to 'overall'

    let dateFilter = {};

    if (filter === "daily") {
      dateFilter = { createdAt: { gte: subDays(new Date(), 1) } }; // Last 24 hours
    } else if (filter === "monthly") {
      dateFilter = { createdAt: { gte: startOfMonth(new Date()) } }; // From start of this month
    }

    // Fetch total codes based on filter
    const totalCodes = await prisma.genCode.count({ where: dateFilter });

    // Fetch total winning codes
    const totalWinningCodes = await prisma.genCode.count({
      where: { ...dateFilter, isWinner: true },
    });

    // Calculate losing codes
    const totalLosingCodes = totalCodes - totalWinningCodes;

    return NextResponse.json(
      { totalCodes, totalWinningCodes, totalLosingCodes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
