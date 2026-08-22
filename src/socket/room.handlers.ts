import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { roomEventSchema } from "../schemas/socket.schema";
import {
  addUserToRoom,
  removeUserFromRoom,
  removeUserFromAllRooms,
} from "../services/presence.service";
import { assertActiveRoom, RoomError } from "../services/room.service";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

function emitSocketError(socket: AppSocket, message: string): void {
  socket.emit("socket:error", { message });
}

export function registerRoomHandlers(io: AppServer, socket: AppSocket): void {
  socket.on("room:join", async (payload) => {
    const parsed = roomEventSchema.safeParse(payload);

    if (!parsed.success) {
      emitSocketError(socket, "Invalid room join payload");
      return;
    }

    const { roomId } = parsed.data;
    const { userId, name } = socket.data.user;

    try {
      await assertActiveRoom(roomId);
      await addUserToRoom(userId, roomId);

      await prisma.roomMembership.upsert({
        where: {
          roomId_userId: { roomId, userId },
        },
        create: { roomId, userId },
        update: {},
      });

      await socket.join(roomId);

      io.to(roomId).emit("room:user-joined", {
        roomId,
        user: { id: userId, name },
      });
    } catch (error) {
      if (error instanceof RoomError) {
        emitSocketError(socket, error.message);
        return;
      }
      emitSocketError(socket, "Failed to join room");
    }
  });

  socket.on("room:leave", async (payload) => {
    const parsed = roomEventSchema.safeParse(payload);

    if (!parsed.success) {
      emitSocketError(socket, "Invalid room leave payload");
      return;
    }

    const { roomId } = parsed.data;
    const { userId } = socket.data.user;

    try {
      await removeUserFromRoom(userId, roomId);
      await socket.leave(roomId);

      io.to(roomId).emit("room:user-left", {
        roomId,
        userId,
      });
    } catch {
      emitSocketError(socket, "Failed to leave room");
    }
  });

  socket.on("disconnect", async () => {
    const { userId } = socket.data.user;

    try {
      const roomIds = await removeUserFromAllRooms(userId);

      for (const roomId of roomIds) {
        io.to(roomId).emit("room:user-left", {
          roomId,
          userId,
        });
      }
    } catch (error) {
      console.error("Failed to clean up presence on disconnect:", error);
    }
  });
}
