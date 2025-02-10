//src\app\api\validateCode\route.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    const foundCode = await prisma.genCode.findFirst({
      where: {
        generatedCode: code,
      },
    });

    if (!foundCode) {
      return new Response(JSON.stringify({ message: "Code not found" }), { status: 404 });
    }

    // Check if code is expired
    if (new Date() > foundCode.expiresAt) {
      return new Response(JSON.stringify({ message: "Code has expired" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Code is valid" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
