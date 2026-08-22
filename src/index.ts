import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket";

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

export { httpServer };
