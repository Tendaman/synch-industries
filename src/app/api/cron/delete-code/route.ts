import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  console.log("Running cleanup job: Deleting expired codes...");

  try {
    const now = new Date();

    // Step 1: Fetch expired codes
    const expiredCodes = await prisma.genCode.findMany({
      where: {
        expiresAt: { lte: now }, // Find expired codes
      },
      select: {
        id: true, // Only fetch the ID
      },
    });

    if (expiredCodes.length > 0) {
      const expiredCodeIds = expiredCodes.map(code => code.id);

      // Step 2: Unassign expired codes
      await prisma.genCode.updateMany({
        where: { id: { in: expiredCodeIds } },
        data: { isAssigned: false },
      });

      // Step 3: Delete related UserGenCode entries
      await prisma.userGenCode.deleteMany({
        where: { genCodeId: { in: expiredCodeIds } },
      });

      // Step 4: Delete related Winner records
      await prisma.winner.deleteMany({
        where: { winningCodeId: { in: expiredCodeIds } },
      });

      // Step 5: Delete expired codes
      await prisma.genCode.deleteMany({
        where: { id: { in: expiredCodeIds } },
      });

      console.log(`Deleted ${expiredCodes.length} expired codes.`);
    }

    return NextResponse.json({ success: true, message: `Deleted ${expiredCodes.length} expired codes.` });
  } catch (error) {
    console.error("Error deleting expired codes:", error);
    return NextResponse.json({ success: false, error: onmessage }, { status: 500 });
  }
}
