import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
let isJobRunning = false; // Prevents duplicate execution

cron.schedule("*/1 * * * *", async () => {
  if (isJobRunning) {
    console.log("Job is already running. Skipping duplicate execution.");
    return;
  }

  isJobRunning = true;
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

    // Fetch all records from History
    const allHistoryRecords = await prisma.history.findMany();

    console.log(`Fetched ${allHistoryRecords.length} records from the History table.`);

    const recordsMap = new Map(); // Stores the latest records by JSON data
    const duplicatesToDelete: number[] = [];

    for (const record of allHistoryRecords) {
      const dataString = JSON.stringify(record.data);
      const existing = recordsMap.get(dataString);

      if (existing) {
        // Keep the most recent record, mark the other for deletion
        if (new Date(record.createdAt) > new Date(existing.createdAt)) {
          duplicatesToDelete.push(existing.id); // Older record to delete
          recordsMap.set(dataString, record); // Update map with the latest record
        } else {
          duplicatesToDelete.push(record.id); // Current record is older, mark for deletion
        }
      } else {
        recordsMap.set(dataString, record);
      }
    }

    // Step 3: Delete duplicates (if any)
    for (const idToDelete of duplicatesToDelete) {
      try {
        // Check if the record still exists before attempting deletion
        const recordExists = await prisma.history.findUnique({
          where: { id: idToDelete },
        });

        if (recordExists) {
          await prisma.history.delete({
            where: { id: idToDelete },
          });
          console.log(`Deleted duplicate record with ID ${idToDelete}.`);
        } else {
          console.log(`Record with ID ${idToDelete} no longer exists. Skipping deletion.`);
        }
      } catch (error) {
        console.error(`Error deleting record with ID ${idToDelete}:`, error);
      }
    }
  } catch (error) {
    console.error("Error syncing data into History table:", error);
  } finally {
    await prisma.$disconnect();
    isJobRunning = false; // Allow next execution
  }
});
