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

    // Generate a random 4-digit code
    const generatedCode = Math.floor(1000 + Math.random() * 9000);

    // Store the generated code and link it to the user
    const genCode = await prisma.genCode.create({
      data: {
        generatedCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 1 day
        linkedUsers: {
          create: {
            userEmail: user.email,
          },
        },
      },
    });

    return NextResponse.json({ generatedCode }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
