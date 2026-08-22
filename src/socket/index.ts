import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { socketAuthMiddleware } from "./auth.middleware";
import { registerRoomHandlers } from "./room.handlers";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";

export type AppSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initSocket(httpServer: HttpServer): AppSocketServer {
  const io: AppSocketServer = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
  });

  return io;
}
