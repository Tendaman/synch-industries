//src\app\api\emailVerification\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Invalid verification link." }, { status: 400 });
    }

    console.log("Received token:", token);

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      console.log("User not found or already verified.");
      return NextResponse.json({ message: "User not found or already verified." }, { status: 400 });
    }

    console.log("User found:", user);

    // Mark user as verified
    await prisma.user.update({
      where: { email: user.email },
      data: { isVerified: true},
    });

    const redirectUrl =`${process.env.NEXT_PUBLIC_URL}/codepage/gen-code?email=${user.email}`;
    console.log("Redirecting to:", redirectUrl);

    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
