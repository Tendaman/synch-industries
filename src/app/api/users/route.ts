//src\app\api\users\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download");
  try {
    if (download === "true") {
      // Download request: only fetch name, surname, and email
      const users = await prisma.user.findMany({
        select: {
          name: true,
          surname: true,
          email: true,
        },
      });

      return NextResponse.json(users, { status: 200 });
    }

    const users = await prisma.user.findMany({
      include: {
        genCodes: {
          include: {
            gencode: true,
          },
        },
      },
    });

    const formattedUsers = users.map((user) => {
      const assignedCode = user.genCodes[0]?.gencode; // Get first assigned code

      return {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email,
        generatedCode: assignedCode ? assignedCode.generatedCode : "N/A",
        result: assignedCode
          ? assignedCode.isWinner
            ? "✅"
            : "❌"
          : "No Code Assigned",
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
