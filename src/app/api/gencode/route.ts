//src\app\api\gencode\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email parameter is required." }, { status: 400 });
    }

    // Find the assigned code for the given user
    const userCode = await prisma.userGenCode.findUnique({
      where: { userEmail: email },
      include: { gencode: true },
    });

    if (!userCode || !userCode.gencode) {
      return NextResponse.json({ message: "No assigned code found for this email." }, { status: 404 });
    }

    return NextResponse.json({ assignedCode: userCode.gencode.generatedCode }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving generated code:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
