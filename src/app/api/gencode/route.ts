//src\app\api\gencode\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Extract email from query parameters
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email parameter is required." }, { status: 400 });
    }

    // Find the user's generated code using the UserGenCode relation
    const userGenCode = await prisma.userGenCode.findUnique({
      where: { userEmail: email },
      include: { gencode: true },
    });

    if (!userGenCode || !userGenCode.gencode) {
      return NextResponse.json({ message: "No code found for this email." }, { status: 404 });
    }

    return NextResponse.json({ generatedCode: userGenCode.gencode.generatedCode }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving generated code:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

