import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  console.log("Running job: Syncing data into History table...");

  try {
    // Step 1: Fetch all data from relevant tables
    const users = await prisma.user.findMany();
    const genCodes = await prisma.genCode.findMany();
    const userGenCodes = await prisma.userGenCode.findMany();
    const winners = await prisma.winner.findMany();

    // Step 2: Structure data for history insertion
    const historyData = [
      { model: "User", data: users },
      { model: "GenCode", data: genCodes },
      { model: "UserGenCode", data: userGenCodes },
      { model: "Winner", data: winners },
    ];

    // Step 3: Sync data with History table
    for (const { model, data } of historyData) {
      for (const item of data) {
        const existingRecord = await prisma.history.findFirst({
          where: {
            model,
            data: {
              path: ["id"],
              equals: item.id,
            },
          },
        });

        if (!existingRecord) {
          await prisma.history.create({
            data: {
              model,
              data: item,
            },
          });
          console.log(`Inserted new ${model} record with ID ${item.id}`);
        } else if (JSON.stringify(existingRecord.data) !== JSON.stringify(item)) {
          await prisma.history.update({
            where: { id: existingRecord.id },
            data: { data: item },
          });
          console.log(`Updated ${model} record with ID ${existingRecord.id}`);
        }
      }
    }

    console.log("Data sync to History table completed.");

    return NextResponse.json({ success: true, message: "History sync completed." });
  } catch (error) {
    console.error("Error syncing data into History table:", error);
    return NextResponse.json({ success: false, error: onmessage }, { status: 500 });
  }
}
