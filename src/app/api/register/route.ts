//src\app\api\register\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "@/lib/email"; // Import email function
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, surname, email } = await req.json();

    // Check if the user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
        return NextResponse.json({ message: "User already registered." }, { status: 409 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    if (!user) {
      // Create a new user if not found
      user = await prisma.user.create({
        data: { name, surname, email, verificationToken },
      });
    }

    await sendVerificationEmail(email, verificationToken);

    const availableCodes = await prisma.genCode.findMany({
      where: { isAssigned: false },
    });

    if (availableCodes.length === 0) {
      return NextResponse.json({ message: "No available codes at the moment." }, { status: 500 });
    }

    // Select a random code
    const randomIndex = Math.floor(Math.random() * availableCodes.length);
    const selectedCode = availableCodes[randomIndex];

    // Mark the code as assigned
    await prisma.genCode.update({
      where: { id: selectedCode.id },
      data: { isAssigned: true },
    });

    // Save the assigned code in UserGenCode table
    await prisma.userGenCode.create({
      data: {
        userEmail: user.email,
        genCodeId: selectedCode.id,
      },
    });

    // If the code is a winner, save the user in the Winner table
    if (selectedCode.isWinner) {
      await prisma.winner.create({
        data: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          winningCodeId: selectedCode.id,
        },
      });
    }

    return NextResponse.json({ assignedCode: selectedCode.generatedCode }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
