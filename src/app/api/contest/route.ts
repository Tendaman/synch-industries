//src\app\api\contest\route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code || isNaN(parseInt(code))) {
            return NextResponse.json({ status: "error", message: "Invalid code format." }, { status: 400 });
        }

        // Find the code in the database
        const genCode = await prisma.genCode.findUnique({
            where: { generatedCode: parseInt(code) },
        });

        if (!genCode) {
            return NextResponse.json({ status: "error", message: "Invalid code. Please try again." }, { status: 400 });
        }

        const isWinner = genCode.isWinner;

        // Step 1: Delete associated userGenCode entry
        await prisma.userGenCode.deleteMany({
            where: { genCodeId: genCode.id },
        });

        // Step 2: If the code is a winner, delete from the Winner table
        if (isWinner) {
            await prisma.winner.deleteMany({
                where: { winningCodeId: genCode.id },
            });
        }

        // Step 3: Delete the actual code from genCode table
        await prisma.genCode.delete({
            where: { id: genCode.id },
        });

        return NextResponse.json({
            status: isWinner ? "won" : "lost",
            message: isWinner
                ? "🎉 Congratulations! You have entered a winning code!"
                : "❌ Sorry, this is not a winning code. Better luck next time!",
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { status: "error", message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
