//src\lib\delExpCodes.ts

import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

// Run every hour to delete expired codes
cron.schedule("0 * * * *", async () => {
  console.log("Running cleanup job: Deleting expired codes...");

  try {
    const now = new Date();
    const deletedCodes = await prisma.genCode.deleteMany({
      where: {
        expiresAt: { lte: now }, // Delete where expiration is in the past
      },
    });

    console.log(`Deleted ${deletedCodes.count} expired codes.`);
  } catch (error) {
    console.error("Error deleting expired codes:", error);
  }
});

export default async function cleanupExpiredCodes() {
  const now = new Date();
  await prisma.genCode.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
  });
}
