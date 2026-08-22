import { Queue, Worker } from "bullmq";
import { createBullMqConnection } from "../lib/bullmq";
import { runRoomArchival } from "../services/archival.service";

export const ROOM_ARCHIVAL_QUEUE = "room-archival";
const SCHEDULER_ID = "midnight-room-archival";
const JOB_NAME = "archive-inactive-rooms";

let archivalWorker: Worker | undefined;
let archivalQueue: Queue | undefined;

export async function startRoomArchivalJob(): Promise<void> {
  if (archivalWorker || archivalQueue) {
    return;
  }

  const queueConnection = createBullMqConnection();
  const workerConnection = createBullMqConnection();

  archivalQueue = new Queue(ROOM_ARCHIVAL_QUEUE, {
    connection: queueConnection,
  });

  archivalWorker = new Worker(
    ROOM_ARCHIVAL_QUEUE,
    async () => runRoomArchival(),
    { connection: workerConnection }
  );

  archivalWorker.on("completed", (job, result) => {
    console.log(`[room-archival] Job ${job.id} completed`, {
      skipped: result.skipped,
      archivedCount: result.roomsArchived.length,
      roomsArchived: result.roomsArchived,
    });
  });

  archivalWorker.on("failed", (job, error) => {
    console.error(`[room-archival] Job ${job?.id} failed:`, error.message);
  });

  await archivalQueue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: "0 0 * * *" },
    {
      name: JOB_NAME,
      data: {},
    }
  );

  console.log("[room-archival] Scheduler registered (daily at midnight UTC)");
}

export async function stopRoomArchivalJob(): Promise<void> {
  await archivalWorker?.close();
  await archivalQueue?.close();
  archivalWorker = undefined;
  archivalQueue = undefined;
}
