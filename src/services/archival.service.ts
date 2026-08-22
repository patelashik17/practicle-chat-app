import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ArchivalHistoryItem, ArchivalRunResult } from "../types/archival";

const INACTIVITY_DAYS = 30;

export function getTodayRunDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function getInactivityCutoff(): Date {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - INACTIVITY_DAYS);
  return cutoff;
}

function toArchivalRunResult(
  log: {
    id: string;
    runDate: Date;
    roomsArchived: string[];
    createdAt: Date;
  },
  skipped: boolean
): ArchivalRunResult {
  return {
    id: log.id,
    runDate: log.runDate,
    roomsArchived: log.roomsArchived,
    createdAt: log.createdAt,
    skipped,
  };
}

export async function runRoomArchival(): Promise<ArchivalRunResult> {
  const runDate = getTodayRunDate();

  const existingLog = await prisma.archivalLog.findUnique({
    where: { runDate },
  });

  if (existingLog) {
    console.log(
      `[room-archival] Already ran for ${runDate.toISOString().slice(0, 10)}, skipping`
    );
    return toArchivalRunResult(existingLog, true);
  }

  const cutoff = getInactivityCutoff();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const duplicateLog = await tx.archivalLog.findUnique({
        where: { runDate },
      });

      if (duplicateLog) {
        return { log: duplicateLog, skipped: true };
      }

      const inactiveRooms = await tx.room.findMany({
        where: {
          status: "active",
          lastActivityAt: { lt: cutoff },
        },
        select: { id: true },
      });

      const roomIds = inactiveRooms.map((room) => room.id);

      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: "archived" },
        });
      }

      const log = await tx.archivalLog.create({
        data: {
          runDate,
          roomsArchived: roomIds,
        },
      });

      return { log, skipped: false };
    });

    if (result.skipped) {
      console.log(
        `[room-archival] Already ran for ${runDate.toISOString().slice(0, 10)}, skipping`
      );
    } else {
      console.log(
        `[room-archival] Archived ${result.log.roomsArchived.length} room(s):`,
        result.log.roomsArchived
      );
    }

    return toArchivalRunResult(result.log, result.skipped);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const log = await prisma.archivalLog.findUniqueOrThrow({
        where: { runDate },
      });
      console.log(
        `[room-archival] Concurrent run detected for ${runDate.toISOString().slice(0, 10)}, skipping`
      );
      return toArchivalRunResult(log, true);
    }

    throw error;
  }
}

export async function getArchivalHistory(): Promise<ArchivalHistoryItem[]> {
  const logs = await prisma.archivalLog.findMany({
    orderBy: { runDate: "desc" },
    take: 10,
  });

  return logs.map((log) => ({
    id: log.id,
    runDate: log.runDate,
    roomsArchived: log.roomsArchived,
    roomsArchivedCount: log.roomsArchived.length,
    createdAt: log.createdAt,
  }));
}
