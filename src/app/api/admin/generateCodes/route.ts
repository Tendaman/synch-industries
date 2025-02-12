// src/app/api/admin/generateCodes/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();

const requestBodySchema = z.object({
  numOfCodes: z.number().min(1),
  numOfWinners: z.number().min(1),
  expirationDate: z.string().optional(),
});

// ** POST - Generate Codes **
export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { numOfCodes, numOfWinners, expirationDate } = requestBodySchema.parse(requestBody);

    if (numOfWinners > numOfCodes) {
      return NextResponse.json({ message: "Number of winners cannot exceed number of codes." }, { status: 400 });
    }

    // Generate random 4-digit codes
    let codes = Array.from({ length: numOfCodes }, () => randomInt(1000, 9999));

    // Ensure unique codes
    codes = [...new Set(codes)];

    const expiration = expirationDate ? new Date(expirationDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create GenCode records
    let genCodes = await Promise.all(
      codes.map(async (generatedCode) => {
        return prisma.genCode.create({
          data: {
            generatedCode,
            expiresAt: expiration,
            isWinner: false, // Default to false, will update later
          },
        });
      })
    );

    // Shuffle the generated codes
    genCodes = genCodes.sort(() => Math.random() - 0.5);

    // Select the first 'numOfWinners' as winning codes
    const winningCodes = genCodes.slice(0, numOfWinners);
    const losingCodes = genCodes.slice(numOfWinners);

    // Mark winners in the database
    await Promise.all(
      winningCodes.map(async (genCode) => {
        await prisma.genCode.update({
          where: { id: genCode.id },
          data: { isWinner: true },
        });

        const user = await prisma.userGenCode.findFirst({
          where: { genCodeId: genCode.id },
          include: { user: true },
        });

        if (user) {
          await prisma.winner.create({
            data: {
              name: user.user.name ?? "",
              surname: user.user.surname ?? "",
              email: user.user.email,
              winningCode: {
                connect: { id: genCode.id },
              },
            },
          });
        }
      })
    );

    // Mark losers explicitly (optional)
    await Promise.all(
      losingCodes.map(async (genCode) => {
        await prisma.genCode.update({
          where: { id: genCode.id },
          data: { isWinner: false },
        });
      })
    );

    return NextResponse.json(
      { message: `${numOfWinners} winners selected, others marked as non-winners.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating codes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ** GET - Fetch Codes with Filtering **
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // Default: all codes

    let whereClause = {};
    if (filter === "winning") whereClause = { isWinner: true };
    else if (filter === "losing") whereClause = { isWinner: false };
    else if (filter === "assigned") whereClause = { isAssigned: true };
    else if (filter === "unassigned") whereClause = { isAssigned: false };

    const codes = await prisma.genCode.findMany({
      where: whereClause,
      select: { 
        id: true, 
        generatedCode: true, 
        isWinner: true, 
        expiresAt: true, 
        isAssigned: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(codes, { status: 200 });
  } catch (error) {
    console.error("Error fetching generated codes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ** DELETE - Remove Expired Codes **
export async function DELETE() {
  try {
    const now = new Date();
    await prisma.genCode.deleteMany({
      where: {
        expiresAt: { lte: now }, // Delete codes where expiration date has passed
      },
    });

    return NextResponse.json({ message: "Expired codes deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting expired codes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
