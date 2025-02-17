import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
let isJobRunning = false; // Prevents duplicate execution

cron.schedule("*/2 * * * *", async () => {
  if (isJobRunning) {
    console.log("Job is already running. Skipping duplicate execution.");
    return;
  }

  isJobRunning = true;
  console.log("Running job: Syncing data into History table and deleting expired codes...");

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

    // Step 3: Loop through all data models and sync with the History table
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

    // Step 4: Fetch and remove duplicate history records
    const allHistoryRecords = await prisma.history.findMany();
    const recordsMap = new Map();
    const duplicatesToDelete: number[] = [];

    for (const record of allHistoryRecords) {
      const dataString = JSON.stringify(record.data);
      const existing = recordsMap.get(dataString);

      if (existing) {
        if (new Date(record.createdAt) > new Date(existing.createdAt)) {
          duplicatesToDelete.push(existing.id);
          recordsMap.set(dataString, record);
        } else {
          duplicatesToDelete.push(record.id);
        }
      } else {
        recordsMap.set(dataString, record);
      }
    }

    for (const idToDelete of duplicatesToDelete) {
      const recordExists = await prisma.history.findUnique({ where: { id: idToDelete } });
      if (recordExists) {
        await prisma.history.delete({ where: { id: idToDelete } });
        console.log(`Deleted duplicate history record with ID ${idToDelete}.`);
      } else {
        console.log(`Record with ID ${idToDelete} no longer exists. Skipping deletion.`);
      }
    }

    // Step 5: Delete expired codes
    const now = new Date();
    const expiredCodes = await prisma.genCode.findMany({
      where: { expiresAt: { lte: now } },
      select: { id: true },
    });

    if (expiredCodes.length > 0) {
      await prisma.genCode.updateMany({
        where: { id: { in: expiredCodes.map(code => code.id) } },
        data: { isAssigned: false },
      });
      await prisma.userGenCode.deleteMany({
        where: { genCodeId: { in: expiredCodes.map(code => code.id) } },
      });
      await prisma.winner.deleteMany({
        where: { winningCodeId: { in: expiredCodes.map(code => code.id) } },
      });
      await prisma.genCode.deleteMany({
        where: { id: { in: expiredCodes.map(code => code.id) } },
      });

      console.log(`Deleted ${expiredCodes.length} expired codes.`);
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  } finally {
    await prisma.$disconnect();
    isJobRunning = false;
  }
});
