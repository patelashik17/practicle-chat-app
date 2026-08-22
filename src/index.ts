import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const httpServer = createServer(app);

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

export { httpServer };
