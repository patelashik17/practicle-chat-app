import cors from "cors";
import express, { Express } from "express";
import routes from "./routes";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(routes);

  return app;
}
