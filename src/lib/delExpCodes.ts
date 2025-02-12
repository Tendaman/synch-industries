// src/lib/delExpCodes.ts

import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

// Run every 15 minutes to delete expired codes
cron.schedule("*/15 * * * *", async () => {
  console.log("Running cleanup job: Deleting expired codes...");

  try {
    const now = new Date();

    // Step 1: Fetch expired codes first
    const expiredCodes = await prisma.genCode.findMany({
      where: {
        expiresAt: { lte: now }, // Find codes that are expired
      },
      select: {
        id: true, // Only select the ID of expired codes
      },
    });

    // Step 2: If there are expired codes, unassign them
    if (expiredCodes.length > 0) {
      // Unassign expired codes
      await prisma.genCode.updateMany({
        where: {
          id: { in: expiredCodes.map(code => code.id) }, // Only expired codes
        },
        data: {
          isAssigned: false, // Unassign the expired codes
        },
      });

      // Step 3: Delete related UserGenCode entries
      await prisma.userGenCode.deleteMany({
        where: {
          genCodeId: { in: expiredCodes.map(code => code.id) }, // Delete entries for expired codes
        },
      });

      // Step 4: Handle related `Winner` records before deleting codes
      await prisma.winner.deleteMany({
        where: {
          winningCodeId: { in: expiredCodes.map(code => code.id) }, // Delete related winners
        },
      });

      // Step 5: Delete the expired codes
      await prisma.genCode.deleteMany({
        where: {
          id: { in: expiredCodes.map(code => code.id) }, // Delete expired codes
        },
      });

      console.log(`Deleted ${expiredCodes.length} expired codes.`);
    }
  } catch (error) {
    console.error("Error deleting expired codes:", error);
  }
});

// Function to clean up expired codes manually if needed
export default async function cleanupExpiredCodes() {
  const now = new Date();

  try {
    // Step 1: Fetch expired codes first
    const expiredCodes = await prisma.genCode.findMany({
      where: {
        expiresAt: { lte: now }, // Find codes that are expired
      },
      select: {
        id: true, // Only select the ID of expired codes
      },
    });

    // Step 2: If there are expired codes, unassign them
    if (expiredCodes.length > 0) {
      await prisma.genCode.updateMany({
        where: {
          id: { in: expiredCodes.map(code => code.id) }, // Only expired codes
        },
        data: {
          isAssigned: false, // Unassign the expired codes
        },
      });

      // Step 3: Delete related UserGenCode entries
      await prisma.userGenCode.deleteMany({
        where: {
          genCodeId: { in: expiredCodes.map(code => code.id) }, // Delete entries for expired codes
        },
      });

      // Step 4: Handle related `Winner` records before deleting codes
      await prisma.winner.deleteMany({
        where: {
          winningCodeId: { in: expiredCodes.map(code => code.id) }, // Delete related winners
        },
      });

      // Step 5: Delete the expired codes
      await prisma.genCode.deleteMany({
        where: {
          id: { in: expiredCodes.map(code => code.id) }, // Delete expired codes
        },
      });

      console.log(`Deleted ${expiredCodes.length} expired codes.`);
    }
  } catch (error) {
    console.error("Error cleaning up expired codes:", error);
  }
}