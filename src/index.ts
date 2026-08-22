import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { startRoomArchivalJob } from "./jobs";
import { initSocket } from "./socket";

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

void startRoomArchivalJob().catch((error: Error) => {
  console.error("Failed to start room archival job:", error.message);
});

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

export { httpServer };
