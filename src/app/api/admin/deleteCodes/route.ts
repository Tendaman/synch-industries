// src/app/api/admin/deleteCodes/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { codesToDelete } = await req.json();

    if (!codesToDelete || !Array.isArray(codesToDelete) || codesToDelete.length === 0) {
      return NextResponse.json({ message: "No codes provided for deletion." }, { status: 400 });
    }

    // Unassign the codes (if assigned) and delete them
    await prisma.$transaction([
      // Unassign codes
      prisma.userGenCode.deleteMany({
        where: {
          genCodeId: { in: codesToDelete },
        },
      }),

      // Delete the codes
      prisma.genCode.deleteMany({
        where: {
          id: { in: codesToDelete },
        },
      }),
    ]);

    return NextResponse.json({ message: "Selected codes unassigned and deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting codes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
